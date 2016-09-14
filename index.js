var ejs = require('ejs');
var fs = require('fs');
var path = require('path');

var render = ejs.render;


var defaultTokens = [
    [/include\s+(\S+)/, "- xejs(\"$1\",options,parentPath)"],
    [/log\s(.+)/, "console.log(\"$1\")"]
];

function generateTokenRegex(token,options) {
    return new RegExp(options.openTag + "\\s*" + token.source + "\\s*" + options.closeTag, "g");
}

function replaceTokens(content,tokens,options) {
    for (var i = 0; i < tokens.length; i++) {
        var reg = generateTokenRegex(tokens[i][0],options);
        content = content.replace(reg, options.openTagEJS + tokens[i][1] + options.closeTagEJS);
    }
    return content;
}

var xejs = function(file,options,parentPath) {
    try {
        if (parentPath) file = path.join(parentPath, "../", file);
        parentPath = file;
        var content = fs.readFileSync(file, 'utf-8');
        var regexp = new RegExp(options.openTag + "\\s*include (.+)\\s*" + options.closeTag, "g");
        content = content.replace(options.tagRegex, options.openTagEJS + "%");
        console.log(content);
        content = replaceTokens(content,options.tokens,options);
        console.log(content);

        content = render(content, {
            xejs: xejs,
            options: options,
            parentPath: parentPath
        });
        return content;
    } catch (e) {
        console.log("XEJS error", e);
        return "";
    }
};

module.exports = function(file, renderingOptions) {
    var tokens=defaultTokens;
    if(renderingOptions.tokens) tokens=tokens.concat(renderingOptions.tokens);
    
    var options = {
        openTagEJS: "<%",
        closeTagEJS: "%>",
        tagRegex: /<%/g,
        openTag: renderingOptions.openTag || "{{",
        closeTag: renderingOptions.closeTag || "}}",
        tokens: tokens
    };
    return xejs(file,options,"");
};
