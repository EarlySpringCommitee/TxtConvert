window.onload = () => {
    document.querySelector('#upload').addEventListener('change', handleFile, false)

    function handleFile(e) {
        var reader = new FileReader;
        var file = e.target.files[0];
        var fileName = e.target.files[0].name
        $('#uploader span.description').text(fileName)
        $('#download a').attr('download', fileName).html(`<i class='download icon'></i>下載 ${fileName}`)
        reader.onload = async(e) => {
            $('#download,#error').attr('style', 'display:none')
            $('#loader').addClass("active indeterminate")

            //轉換囉
            convent(e.target.result)
        }
        reader.readAsText(file);
    }
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