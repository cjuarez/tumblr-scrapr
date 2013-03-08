
/*
 * GET images
 */

var cheerio  = require('cheerio'),
    request  = require('request'),
    fs       = require('fs'),
    archiver = require("archiver");

function generateTempName(extension) {
    var now = new Date();
    return [
        now.getYear(), now.getMonth(), now.getDate(),
        '-',
        process.pid,
        '-',
        (Math.random() * 0x100000000 + 1).toString(36),
        '.',
        extension
    ].join('');
}

function launchNextRequest(url, currentPage, pages, res, images) {
    request({uri: url+currentPage}, function (err, response, body) {
        console.log(url+currentPage);
        var $ = null;
        if (err && response.statusCode !== 200) {
            console.log('Request error: ' + err);
        }
        $ = cheerio.load(body);
        $('.post img').each(function () {
            images.push($(this).attr('src'));
        });
        if (currentPage < pages) {
            launchNextRequest(url, ++currentPage, pages, res, images);
        } else {
            console.log(images);
            res.render('images', {
                'images': images
            });
        }
    })
}

exports.index = function (req, res) {
    res.render('index', {
        title: 'cjuarez tumblr scrapr'
    });
};

exports.load = function(req, res) {
    var url = 'http://' + req.body.url + '.tumblr.com/page/',
        pages = req.body.pages,
        images = [];
    launchNextRequest(url, 1, pages, res, images);
};

exports.download = function (req, res) {
    var i = 0,
        len = 0,
        urls = req.body.images,
        zipFile = archiver('zip'),
        tempFileName = './public/' + generateTempName('zip'),
        zipStream = fs.createWriteStream(tempFileName),
        imageStream = null,
        urlSegments = [],
        fileName = '';
    zipFile.on('error', function (err) {
        throw err;
    });
    zipFile.pipe(zipStream);
    for (i = 0, len = urls.length; i < len; i++) {
        urlSegments = urls[i].split('/');
        fileName = urlSegments[urlSegments.length - 1];
        zipFile.addFile(request(urls[i]), {name: fileName});
    }
    zipFile.finalize(function (err, written) {
        if (err) {
            throw err;
        }
        console.log(written + ' total bytes written');
        res.json({
            file: tempFileName
        });
    });
};