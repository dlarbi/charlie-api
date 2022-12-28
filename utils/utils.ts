
//Function to get the hostname of a URL
export function getHostname(url: string): string {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

export const asyncSpawn = async (command: string, args: string[], options: { cwd: string }) => {
    const { spawn } = require('child_process');
    const child = spawn(command, args, options);

    let data = "";
    for await (const chunk of child.stdout) {
        console.log('stdout chunk: '+chunk);
        data += chunk;
    }
    let error = "";
    for await (const chunk of child.stderr) {
        console.error('stderr chunk: '+chunk);
        error += chunk;
    }
    const exitCode = await new Promise( (resolve, reject) => {
        child.on('close', resolve);
    });

    if( exitCode) {
        console.log('exitCode', exitCode, error, data);
        throw new Error( `subprocess error exit ${exitCode}, ${error}`);
    }
    return data;
}