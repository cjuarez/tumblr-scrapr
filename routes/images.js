
/*
 * GET images
 */

var cheerio  = require('cheerio'),
    request  = require('request'),
    fs       = require('fs'),
    archiver = require("archiver");

exports.load = function(req, res) {
    var url = 'http://cjuarez.tumblr.com';
    request({uri: url}, function(err, response, body) {
        //Just a basic error check
        if (err && response.statusCode !== 200) {
            console.log('Request error.');
        }
        var $ = cheerio.load(body);
        var images = [];
        $('.post-photo img').each(function () {
            images.push($(this).attr('src'));
        });
        res.render('images', {
            'title': url,
            'images': images
        });
        res.end();
    });
};

exports.download = function (req, res) {
    var i = 0,
        len = 0,
        urls = req.body.images,
        zipFile = archiver('zip'),
        //zipStream = fs.createWriteStream(res),
        imageStream = null,
        urlSegments = [],
        fileExtension = '',
        savedFiles = 0,
        files = [],
        checkSavedFiles = function () {
            savedFiles++;
            if (savedFiles === len) {
                zipFiles();
            }
        },
        zipFiles = function () {
            var i = 0,
                len = 0;
            for (i =0, len = files.length; i < len; i++) {
                zipFile.addFile(fs.createReadStream('./' + files[i]), {name: files[i]});
            }
            zipFile.finalize(function(err, written) {
                if (err) {
                    throw err;
                }
                console.log(written + ' total bytes written');
                //res.download('./public/images.zip');
            });
        };
    zipFile.on('error', function(err) {
        throw err;
    });
    zipFile.pipe(res);
    for (i = 0, len = urls.length; i < len; i++) {
        urlSegments = urls[i].split('/');
        fileName = urlSegments[urlSegments.length - 1];
        imageStream = fs.createWriteStream('./' + fileName);
        request.get(urls[i]).pipe(imageStream);
        imageStream.on('close', checkSavedFiles);
        files.push(fileName);
    }
};