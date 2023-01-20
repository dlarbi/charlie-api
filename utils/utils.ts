import { ProjectStatuses } from "../constants/constants";
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


export function createHeaderArray(htmlString: string): string[] {
    let headerArray: string[] = [];
    const regex = /<h([1-6])>(.*?)<\/h\1>/g;
    let match = regex.exec(htmlString);

    while (match) {
        headerArray.push(match[2]);
        match = regex.exec(htmlString);
    }

    return headerArray;
}

export const getProgressFromStatus = status => {
    let result = 0;
    status === ProjectStatuses.Crawling ?
        result = .3 :
    status === ProjectStatuses.Extracting ?
        result = .6 :
    status === ProjectStatuses.Analysing ?
        result = .8 :
        result = 1;
    return result;
}

export const getLimitsByAccountType = (accountType: string) => {
    const limitsToAccountTypeMap = {
        free: {
            urls: 50,
            projects: 2
        },
        professional: {
            urls: 200,
            projects: 5
        },
        enterprise: {
            urls: 1500,
            projects: 'Unlimited'
        },
        god: {
            urls: 999999,
            projects: 'Unlimited'
        }
    }

    return limitsToAccountTypeMap[accountType] || limitsToAccountTypeMap['free'];

}