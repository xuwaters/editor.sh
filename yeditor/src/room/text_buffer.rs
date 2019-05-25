use ropey::Rope;
use std::ops::Range;

#[derive(Debug)]
pub enum EditError {
    InvalidPosition,
}

// line and column are one-based index
#[derive(Debug, Clone)]
pub struct TextPosition {
    pub line: usize,
    pub column: usize,
}

impl TextPosition {
    pub fn new(line: usize, column: usize) -> Self {
        TextPosition { line, column }
    }
}

pub struct TextBuffer {
    buffer: Rope,
}

impl TextBuffer {
    pub fn new() -> Self {
        Self {
            buffer: Rope::new(),
        }
    }

    pub fn text(&self) -> String {
        let mut s = String::new();
        for chunk in self.buffer.chunks() {
            let curr = unsafe { String::from_utf8_unchecked(chunk.as_bytes().to_vec()) };
            s.push_str(curr.as_str());
        }
        s
    }

    pub fn set_text(&mut self, text: &str) {
        self.buffer.remove(..);
        self.buffer.insert(0, text);
    }

    pub fn edit(
        &mut self,
        start: &TextPosition,
        end: &TextPosition,
        text: &str,
    ) -> Result<(), EditError> {
        let char_range = self.get_char_range(start, end)?;
        if char_range.start != char_range.end {
            self.buffer.remove(char_range.clone());
        }
        if text.len() > 0 {
            self.buffer.insert(char_range.start, text);
        }
        Ok(())
    }

    fn get_char_index(&self, pos: &TextPosition) -> Result<usize, EditError> {
        let total_lines = self.buffer.len_lines();
        if pos.line < 1 || pos.line > total_lines + 1 {
            warn!(
                "edit position line out of range: {:?}, total_lines = {}",
                pos, total_lines
            );
            return Err(EditError::InvalidPosition);
        }
        let line_idx = pos.line - 1;
        let line_len = if line_idx < total_lines {
            self.buffer.line(line_idx).len_chars()
        } else {
            0
        };
        if pos.column < 1 || pos.column > line_len+1 {
            warn!(
                "edit position column out of range: {:?}, total_columns = {}",
                pos, line_len
            );
            return Err(EditError::InvalidPosition);
        }
        let line_start = self.buffer.line_to_char(line_idx);
        Ok(line_start + pos.column - 1)
    }

    fn get_char_range(
        &self,
        start: &TextPosition,
        end: &TextPosition,
    ) -> Result<Range<usize>, EditError> {
        let char_start = self.get_char_index(start)?;
        let char_end = self.get_char_index(end)?;
        Ok(char_start..char_end)
    }
}
