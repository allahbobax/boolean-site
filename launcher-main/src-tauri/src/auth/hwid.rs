#[cfg(target_os = "windows")]
use serde::Deserialize;
use sha2::{Sha256, Digest};

#[cfg(target_os = "windows")]
use wmi::{WMIConnection, COMLibrary};

#[cfg(target_os = "windows")]
#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
struct DiskDrive {
    serial_number: Option<String>,
}

#[cfg(target_os = "windows")]
#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
struct Processor {
    processor_id: Option<String>,
    name: Option<String>,
}

#[cfg(target_os = "windows")]
#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
struct BaseBoard {
    serial_number: Option<String>,
    product: Option<String>,
}

pub async fn get_hwid() -> Result<String, String> {
    let (tx, rx) = tokio::sync::oneshot::channel();

    std::thread::spawn(move || {
        let result = (|| -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
            #[cfg(target_os = "windows")]
            {
                let com_con = COMLibrary::new()?;
                let wmi_con = WMIConnection::new(com_con)?;
                let mut hwid_components = Vec::new();

                // 1. Processor
                match wmi_con.query::<Processor>() {
                    Ok(processors) => {
                        for p in processors {
                            if let Some(id) = p.processor_id { hwid_components.push(id); }
                            if let Some(name) = p.name { hwid_components.push(name); }
                        }
                    },
                    Err(_e) => {},
                }

                // 2. BaseBoard
                match wmi_con.query::<BaseBoard>() {
                    Ok(boards) => {
                        for b in boards {
                            if let Some(sn) = b.serial_number { hwid_components.push(sn); }
                            if let Some(prod) = b.product { hwid_components.push(prod); }
                        }
                    },
                    Err(_e) => {},
                }

                // 3. DiskDrive
                match wmi_con.query::<DiskDrive>() {
                    Ok(disks) => {
                        for d in disks {
                            if let Some(sn) = d.serial_number { hwid_components.push(sn); }
                        }
                    },
                    Err(_e) => {},
                }
                
                if hwid_components.is_empty() {
                    // If WMI failed completely to find anything useful
                    return Ok(uuid::Uuid::new_v4().to_string());
                }

                let raw_hwid = hwid_components.join("|");
                // Hash the combined string
                let mut hasher = Sha256::new();
                hasher.update(raw_hwid);
                let result = hasher.finalize();
                
                Ok(hex::encode(result))
            }
            
            #[cfg(not(target_os = "windows"))]
            {
                // For non-Windows platforms, use a simple machine ID approach
                use std::fs;
                let mut hwid_components = Vec::new();
                
                // Try to get some system identifiers
                if let Ok(content) = fs::read_to_string("/etc/machine-id") {
                    hwid_components.push(content.trim().to_string());
                }
                
                if let Ok(content) = fs::read_to_string("/etc/hostname") {
                    hwid_components.push(content.trim().to_string());
                }
                
                if hwid_components.is_empty() {
                    // Fallback to UUID
                    return Ok(uuid::Uuid::new_v4().to_string());
                }
                
                let raw_hwid = hwid_components.join("|");
                let mut hasher = Sha256::new();
                hasher.update(raw_hwid);
                let result = hasher.finalize();
                
                Ok(hex::encode(result))
            }
        })();

        // Send the result back
        match result {
            Ok(id) => { let _ = tx.send(Ok(id)); },
            Err(e) => { let _ = tx.send(Err(e.to_string())); }
        }
    });

    match rx.await {
        Ok(thread_result) => match thread_result {
            Ok(id) => Ok(id),
            Err(_e) => {
                Ok(uuid::Uuid::new_v4().to_string())
            }
        },
        Err(_) => {
            Ok(uuid::Uuid::new_v4().to_string())
        }
    }
}
