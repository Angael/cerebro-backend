import fs from 'fs-extra';
import https from 'https';

export const download = (url: string, dest: string) =>
  new Promise((res, rej) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
          file.close(res); // close() is async, call cb after close completes.
        });
      })
      .on('error', function (err) {
        // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        rej(err.message);
      });
  });
