use actix::prelude::Message;
use serde_derive::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, Message)]
#[serde(rename_all = "snake_case")]
pub struct ServiceStats {
    pub rooms: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Message)]
#[serde(rename_all = "snake_case")]
pub enum ServiceRequests {
    Reset(RunEnv),
    Run(Code),
    WinSize(WinSize),
    Stdin(String),
}

#[derive(Debug, Clone, Deserialize, Serialize, Message)]
#[serde(rename_all = "snake_case")]
pub enum ServiceResponses {
    Init(ServiceResult<InitResp>),
    Reset(ServiceResult<ResetResp>),
    Run(ServiceResult<RunResp>),
    WinSize(ServiceResult<WinSize>),
    Stdout(ServiceResult<StdoutResp>),
}

// service result

#[derive(Debug, Clone, Deserialize, Serialize, Message)]
#[serde(rename_all = "snake_case")]
pub enum ServiceResult<T> {
    Ok(T),
    Err(ServiceError),
}

impl<T> From<Result<T, ServiceError>> for ServiceResult<T> {
    fn from(result: Result<T, ServiceError>) -> Self {
        match result {
            Ok(res) => ServiceResult::Ok(res),
            Err(err) => ServiceResult::Err(err),
        }
    }
}

impl<T> Into<Result<T, ServiceError>> for ServiceResult<T> {
    fn into(self) -> Result<T, ServiceError> {
        match self {
            ServiceResult::Ok(v) => Result::Ok(v),
            ServiceResult::Err(e) => Result::Err(e),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, Message)]
#[serde(rename_all = "snake_case")]
pub enum ServiceError {
    // service errors
    ErrServiceInternal,
    // init errors
    ErrInitRoomExists,
}

// init

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct InitResp {}

// reset

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct RunEnv {
    pub win_size: WinSize,
    pub language: String,
    pub boot: Option<Code>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct ResetResp {}

// run

pub type CodeId = u32;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct Code {
    pub id: CodeId,
    pub language: String,
    pub filename: String,
    pub content: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct RunResp {
    pub id: CodeId,
    pub exit_status: i32,
    pub duration_ms: f64,
}

// win size

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct WinSize {
    pub row: u16,
    pub col: u16,
}

// stdout

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct StdoutResp {
    pub id: CodeId,
    pub data: String,
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn json_service_requests() {
        let req = ServiceRequests::Run(Code {
            id: 0,
            language: "python3".into(),
            filename: "".into(),
            content: r#"print("hello")"#.into(),
        });
        match serde_json::to_string(&req) {
            Ok(json) => {
                println!("ServiceRequests = {}", json);
                assert_eq!(
                    r#"{"t":"run","c":{"id":0,"language":"python3","filename":"","content":"print(\"hello\")"}}"#, 
                    json,
                );
            }
            Err(err) => {
                panic!("json encoding failure: {:?}", err);
            }
        }
    }

    #[test]
    fn json_service_responses() {
        let resp = ServiceResponses::Init(Err(ServiceError::ErrInitRoomExists).into());
        match serde_json::to_string(&resp) {
            Ok(json) => {
                println!("ServiceResponses = {}", json);
                assert_eq!(r#"{"t":"init","c":{"err":"err_init_room_exists"}}"#, json);
            }
            Err(err) => {
                panic!("json encoding failure: {:?}", err);
            }
        }

        let resp = ServiceResponses::Stdout(
            Ok(StdoutResp {
                id: 3,
                data: "code output".to_owned(),
            })
            .into(),
        );
        match serde_json::to_string(&resp) {
            Ok(json) => {
                println!("ServiceResponse = {}", json);
                assert_eq!(
                    r#"{"t":"stdout","c":{"ok":{"id":3,"data":"code output"}}}"#,
                    json
                );
            }
            Err(err) => {
                panic!("json encoding failure: {:?}", err);
            }
        }
    }
}
