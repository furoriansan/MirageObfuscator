import fs from 'node:fs';
import path from 'node:path';

export class FileHandler {

    static saveFile(filePath, content) {
        try {
            fs.writeFileSync(filePath, content);
        } catch (e) {
            console.error("Error saving file:", e.message);
            return false;
        }
        return true;
    }

    static doesFileExists(filePath) {
        return fs.existsSync(filePath);
    }

    static readFile(filePath) {
        try {
            return  fs.readFileSync(filePath, "utf8");
        } catch (e) {
            console.error("Error reading file:", e.message);
            return false;
        }
    }

    static getFileData(filePath) {
        try {
            return  fs.readFileSync(filePath);
        } catch (e) {
            console.error("Error reading file:", e.message);
            return false;
        }
    }


    static getFileBuffer(filePath) {
        try {
            return  fs.readFileSync(filePath);
        } catch (e) {
            console.error("Error reading file:", e.message);
            return false;
        }
    }


    static getFiles(filePath) {
        try {
            const items = fs.readdirSync(filePath);
            return items.map(item => {
                const fullPath = path.join(filePath, item);
                const stats = fs.statSync(fullPath);
                return {
                    name: item,
                    isDirectory: stats.isDirectory(),
                    isFile: stats.isFile()
                };
            });
        } catch (e) {
            console.error("Error getting files:", e.message);
            return false;
        }
    }

     static getAllFiles(dirPath, arrayOfFiles = []) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        entries.forEach(entry => {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                this.getAllFiles(fullPath, arrayOfFiles);
            } else if (entry.isFile()) {
                arrayOfFiles.push(fullPath);
            }
        });
        return arrayOfFiles;
    }

    static getFilesAndDirs(dirPath, result = { files: [], dirs: [] }) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        entries.forEach(entry => {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                result.dirs.push(fullPath);
                this.getFilesAndDirs(fullPath, result);
            } else if (entry.isFile()) {
                result.files.push(fullPath);
            }
        });
        return result;
    }



    static getFile(filePath) {
        try {
            return fs.readFileSync(filePath, "utf8");
        } catch (e) {
            console.error("Error getting file:", e.message);
            return false;
        }
    }

    static renameFile(filePath, newPath) {
        try {
            const destinationDir = path.dirname(newPath);
            if (!fs.existsSync(destinationDir)) {
                fs.mkdirSync(destinationDir, { recursive: true });
            }
            fs.renameSync(filePath, newPath);
            return true;
        } catch (e) {
            console.error("Error renaming file:", e.message);
            return false;
        }
    }

    static deleteEmptyDirs(dir) {
        if (!fs.existsSync(dir)) return;

        let stat;
        try {
            stat = fs.lstatSync(dir);
        } catch { return; }

        if (!stat.isDirectory()) return;

        let files;
        try {
            files = fs.readdirSync(dir);
        } catch { return; }

        for (const file of files) {
            const fullPath = path.join(dir, file);
            try {
                const fileStat = fs.lstatSync(fullPath);
                if (fileStat.isDirectory()) {
                    this.deleteEmptyDirs(fullPath);
                }
            } catch {}
        }
        try {
            const after = fs.readdirSync(dir);
            if (after.length === 0) {
                fs.rmdirSync(dir);
            }
        } catch {}
    }


    static deleteFile(filePath) {
        try {
            fs.rmSync(filePath, {recursive: true, force: true});
        } catch (e) {
            console.error("Error deleting file:", e.message);
        }
        return undefined;
    }
}