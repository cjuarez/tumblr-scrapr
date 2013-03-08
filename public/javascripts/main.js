$(function() {
    $('#btn-scrap').click(function () {
        $.post('/images', {
            url: $.trim($('#tumblr').val()),
            pages: $('#pages').val()
        }).done(function (body, response) {
            $('.fetched-images').html(body);
        });
    });
});