use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub(crate) struct WipeResult {
    pub(crate) success: bool,
    pub(crate) deleted: Vec<String>,
    pub(crate) errors: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LaunchOptions {
    pub username: String,
    #[serde(alias = "javaPath")]
    pub java_path: Option<String>,
    /// RAM allocation in megabytes (e.g., 4096 for 4GB)
    #[serde(alias = "ramMb")]
    pub ram_mb: Option<u32>,
    /// Window width in pixels
    #[serde(alias = "windowWidth")]
    pub window_width: Option<u32>,
    /// Window height in pixels
    #[serde(alias = "windowHeight")]
    pub window_height: Option<u32>,
    /// Fullscreen mode
    pub fullscreen: Option<bool>,
    /// Custom install path from user settings
    #[serde(alias = "installPath")]
    pub install_path: Option<String>,
}

#[derive(Serialize, Clone)]
pub(crate) struct ProgressEvent {
    pub(crate) stage: String,
    pub(crate) progress: f64,
    pub(crate) current: Option<String>,
}

#[derive(Serialize, Clone)]
pub(crate) struct LogEvent {
    pub(crate) message: String,
}
