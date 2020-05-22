const fs = require('fs');
const os = require('os');
const path = require('path')

class TmpFs {
    static del(path_to, file_name) {
        return new Promise((resolve, reject) => {
            const base_path = path.join(os.tmpdir(), path_to);
            const file_path = path.join(base_path, file_name);
            if (fs.existsSync(file_path)) {
                fs.unlink(file_path, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
    static get(path_to, file_name) {
        return new Promise((resolve, reject) => {
            const base_path = path.join(os.tmpdir(), path_to);
            const file_path = path.join(base_path, file_name);
            if (fs.existsSync(file_path)) {
                fs.readFile(file_path, (error, value) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(value.toString());
                    }
                });
            } else {
                resolve();
            }
        });
    }
    static set(path_to, file_name, value) {
        return new Promise((resolve, reject) => {
            const base_path = path.join(os.tmpdir(), path_to);
            const file_path = path.join(base_path, file_name);
            if (!fs.existsSync(base_path)) {
                fs.mkdirSync(base_path, (error) => {
                    if (error) {
                        reject(error);
                    }
                });
            }
            if (value !== undefined) {
                fs.writeFile(file_path, value, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(value);
                    }
                });
            } else {
                resolve(this.del(path_to, file_name));
            }
        });
    }
}
class Storage {
    constructor(domain, user, property = undefined) {
        this.domain = domain;
        this.user = user;
        this.property = property;
    }
    del() {
        return TmpFs.del(this.domain, this.property
            ? `${this.user}#${this.property}`
            : this.user);
    }
    get() {
        return TmpFs.get(this.domain, this.property
            ? `${this.user}#${this.property}`
            : this.user);
    }
    set(value) {
        return TmpFs.set(this.domain, this.property
            ? `${this.user}#${this.property}`
            : this.user, value);
    }
}
module.exports = {
    Storage, TmpFs
};
