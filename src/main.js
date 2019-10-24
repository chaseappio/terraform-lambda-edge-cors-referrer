'use strict';
const http = require('https');
let path = require('path');
let {readFileSync} = require('fs');
const url = require('url');

const params = path.resolve('params.json');
const configString = readFileSync(params).toString();
const config = JSON.parse(configString);

exports.handler = async (event, context, callback) => {

    const cf = event.Records[0].cf;
    
    const request = cf.request;
    
    let referer = extractHeader(request,'referer');
    let ua = extractHeader(request,'user-agent');
    let host = extractHeader(request,'host');

    if(request.uri.startsWith('/apps')){
        request.uri = request.uri.substring(5);
    }
    
    let extensions = [];

    if(config.extensions){
        extensions = config.extensions.split('|');
    }
    
    for (const ext in extensions) {
        if(request.uri.endsWith('.' +  extensions[ext])){
            callback(null,request);
            return;
        }
    }


    
    if ( ua && ua.indexOf(' Electron') != -1 )
    {
        callback(null,request);
        return;
    }

    if(referer != null){
        
        const parsedReferer = url.parse(referer);

        if(  parsedReferer.host === host && parsedReferer.pathname === config.refererPath)
        {
            callback(null,request);
            return;
        }
    }

    const response = {
        status: '403',
        statusDescription: 'Forbidden'
    };


    callback(null,response);
};

function extractHeader(request,headerName) {
    if(!request){
        return null;
    }

    if(!request.headers){
        return null;
    }

    if(!request.headers[headerName]){
        return null;
    }

    if(request.headers[headerName].length <= 0){
        return null;
    }

    return request.headers[headerName][0].value;
}