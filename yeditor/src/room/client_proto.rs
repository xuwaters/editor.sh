use actix::prelude::*;

// client protocol
// Terminal messages only for xterm frontend
// Editor message only for editor synchronization frontend
// Command messages only for other functions, e.g. Run, Reset, SetLang

#[derive(Debug, Clone, Deserialize, Serialize, Message)]
#[serde(tag = "t", content = "c")]
pub enum ClientRequests {
    #[serde(rename = "e")]
    Editor(EditorSyncParams),

    #[serde(rename = "c")]
    Command(CommandRequestParams),

    #[serde(rename = "t")]
    Terminal(TerminalRequestParams),
}

#[derive(Debug, Clone, Deserialize, Serialize, Message)]
#[serde(tag = "t", content = "c")]
pub enum ClientResponses {
    #[serde(rename = "e")]
    Editor(EditorSyncParams),

    #[serde(rename = "c")]
    Command(CommandResponseParams),

    #[serde(rename = "t")]
    Terminal(TerminalResponseParams),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum EditorSyncParams {
    #[serde(rename = "changed")]
    Changed(EditorChangedEvent),

    #[serde(rename = "text")]
    Text(String),

    #[serde(rename = "cursor")]
    Cursor(CursorChangedEvent),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CursorChangedEvent {
    pub peer_id: u32,
    pub position: Option<CursorPosition>,
    pub secondary_positions: Vec<CursorPosition>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CursorPosition {
    pub line: i32,
    pub column: i32,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct EditorChangedEvent {
    pub version: i64,
    pub changes: Vec<TextChange>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TextChange {
    pub range: TextRange,
    pub text: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TextRange {
    pub start_line: i32,
    pub start_column: i32,
    pub end_line: i32,
    pub end_column: i32,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum CommandRequestParams {
    #[serde(rename = "reset")]
    Reset(),

    #[serde(rename = "run_code")]
    RunCode(String),

    #[serde(rename = "set_lang")]
    SetLang(String),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum CommandResponseParams {
    #[serde(rename = "set_lang")]
    SetLang(String),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum TerminalRequestParams {
    #[serde(rename = "set_size")]
    SetSize(u16, u16), // row, col

    #[serde(rename = "stdin")]
    Stdin(String),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum TerminalResponseParams {
    #[serde(rename = "stdout")]
    Stdout(String),
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn serde_client_request_terminal_set_size() {
        let req = ClientRequests::Terminal(TerminalRequestParams::SetSize(25, 80));
        match serde_json::to_string(&req) {
            Err(err) => {
                panic!("can not serialize req: {:?}", req);
            }
            Ok(json) => {
                println!("client req json = {}", json);
                let expected = r#"{"t":"tm","c":{"set_size":[25,80]}}"#;
                assert_eq!(expected, json);
            }
        }
    }

    #[test]
    fn serde_client_request_terminal_stdin() {
        let req = ClientRequests::Terminal(TerminalRequestParams::Stdin("hello".to_owned()));
        match serde_json::to_string(&req) {
            Err(err) => {
                panic!("can not serialize req: {:?}, err = {:?}", req, err);
            }
            Ok(json) => {
                println!("client req json = {}", json);
                let expected = r#"{"t":"tm","c":{"stdin":"hello"}}"#;
                assert_eq!(expected, json);
            }
        }
    }

    #[test]
    fn serde_client_request_terminal_reset() {
        let req = ClientRequests::Command(CommandRequestParams::Reset());
        match serde_json::to_string(&req) {
            Err(err) => {
                panic!("can not serialize req: {:?}, err = {:?}", req, err);
            }
            Ok(json) => {
                println!("client req json = {}", json);
                let expected = r#"{"t":"tm","c":{"reset":[]}}"#;
                assert_eq!(expected, json);
            }
        }
    }
}
