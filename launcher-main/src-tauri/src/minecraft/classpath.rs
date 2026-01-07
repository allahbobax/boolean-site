use std::path::PathBuf;

use serde_json::Value;

pub(crate) fn build_classpath(
    launch_dir: &PathBuf,
    version_json: &Value,
    version_jar_path: &PathBuf,
) -> anyhow::Result<Vec<String>> {
    let mut entries: Vec<String> = Vec::new();
    let libraries_dir = launch_dir.join("libraries");

    if let Some(libs) = version_json.get("libraries").and_then(|v| v.as_array()) {
        for lib in libs {
            if !is_library_allowed_for_current_os(lib) {
                continue;
            }

            let name = match lib.get("name").and_then(|v| v.as_str()) {
                Some(n) => n,
                None => continue,
            };

            if name.contains(":natives-") {
                continue;
            }

            if let Some(path) = maven_name_to_relative_jar_path(name) {
                let full_path = libraries_dir.join(path);
                if full_path.exists() {
                    entries.push(full_path.to_string_lossy().to_string());
                }
            }
        }
    }

    entries.push(version_jar_path.to_string_lossy().to_string());
    Ok(entries)
}

fn maven_name_to_relative_jar_path(name: &str) -> Option<PathBuf> {
    let parts: Vec<&str> = name.split(':').collect();
    if parts.len() < 3 {
        return None;
    }

    let group = parts[0];
    let artifact = parts[1];
    let version_raw = parts[2];
    let version = version_raw
        .split_once('@')
        .map(|(v, _ext)| v)
        .unwrap_or(version_raw);
    let classifier = if parts.len() >= 4 { Some(parts[3]) } else { None };

    let group_path = group.replace('.', &std::path::MAIN_SEPARATOR.to_string());

    let file_name = match classifier {
        Some(c) => format!("{artifact}-{version}-{c}.jar"),
        None => format!("{artifact}-{version}.jar"),
    };

    Some(PathBuf::from(group_path).join(artifact).join(version).join(file_name))
}

fn is_library_allowed_for_current_os(lib: &Value) -> bool {
    let rules = match lib.get("rules").and_then(|v| v.as_array()) {
        Some(r) => r,
        None => return true,
    };

    let mut allowed = true;
    for rule in rules {
        let action = match rule.get("action").and_then(|v| v.as_str()) {
            Some(a) => a,
            None => continue,
        };

        let os_matches = match rule.get("os") {
            None => true,
            Some(os) => {
                let name = os.get("name").and_then(|v| v.as_str());
                match name {
                    None => true,
                    Some("windows") => cfg!(target_os = "windows"),
                    Some("linux") => cfg!(target_os = "linux"),
                    Some("osx") => cfg!(target_os = "macos"),
                    Some(_) => false,
                }
            }
        };

        if os_matches {
            allowed = action == "allow";
        }
    }

    allowed
}

pub(crate) fn offline_uuid_for_username(username: &str) -> String {
    use uuid::Uuid;

    let mut b = [0u8; 16];
    let hash = md5::compute(format!("OfflinePlayer:{username}").as_bytes());
    b.copy_from_slice(&hash.0);

    // UUID v3 (name-based, MD5) layout
    b[6] = (b[6] & 0x0f) | 0x30;
    b[8] = (b[8] & 0x3f) | 0x80;

    Uuid::from_bytes(b).to_string()
}
