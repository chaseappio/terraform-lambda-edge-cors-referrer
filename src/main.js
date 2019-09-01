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
    
    let referer = request.headers['referer'];

    if(referer){
        referer = referer.value;
    }

    let host = cf.headers['host'];

    if(host){
        host = host.value;
    }

    if(referer){
        const parsedReferer = url.parse(referrer);

        if(parsedReferer.host === host && parsedReferer.pathname === config.refererPath)
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