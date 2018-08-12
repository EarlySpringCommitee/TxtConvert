window.onload = () => {
    document.querySelector('#upload').addEventListener('change', handleFile, false)

    function handleFile(e) {
        var reader = new FileReader;
        var file = e.target.files[0];
        $('#uploader span.description').text(e.target.files[0].name)
        $('#download a').attr('download', `${e.target.files[0].name}`)
        $('#download a').html(`<i class='download icon'></i>下載 ${e.target.files[0].name}`)
        reader.onload = async(e) => {
            $('#download,#error').attr('style', 'display:none')
            $('#loader').addClass("active indeterminate").text(`正在將檔案發給小熊貓`)

            // 這裡會讀入字串 t
            var t = e.target.result;
            var link = await convent(t)

        }
        reader.readAsText(file);
    }
}
async function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

async function convent(t) {
    try {
        var req = await axios.get(`https://api.zhconvert.org/convert?converter=Taiwan&text=${encodeURIComponent(t)}&prettify=1`)
        var data = new Blob([req.data.data.text], { type: 'text/plain;charset=utf-8;' });
        var url = URL.createObjectURL(data);
        $('#download').removeAttr('style')
        $('#download a').attr('href', url)
    } catch (error) {
        $('#error').removeAttr('style')
        $('#error p').text(error)
    }
    $('#loader').removeClass("active")
}