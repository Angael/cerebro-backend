import fs from 'fs-extra';
import https from 'https';
import { betterUnlink } from '../../utils/betterUnlink';

export const download = (url: string, dest: string) =>
  new Promise((res, rej) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
          file.close(res);
        });
      })
      .on('error', function (err) {
        betterUnlink(dest);
        rej(err.message);
      });
  });
