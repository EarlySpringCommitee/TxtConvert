var varray;

window.onload = () => {
    document.querySelector('#upload').addEventListener('change', handleFile, false)
    document.getElementById('encode').onchange = function() {
        let encode = this.options[this.selectedIndex].value;
        $('#preview pre').text((new TextDecoder(encode)).decode(varray.slice(0,100)))
    }

    function handleFile(e) {
        let reader = new FileReader;
        let file = e.target.files[0];
        let fileName = e.target.files[0].name
        $('#uploader span.description').text(fileName)
        $('#download a').attr('download', fileName).html(`<i class='download icon'></i>下載 ${fileName}`)
        reader.onload = async(e) => {
            let buffer = e.target.result
            varray = new Uint8Array(buffer)
            $('#download,#error').attr('style', 'display:none')
                //預覽
            $('#preview pre').text((new TextDecoder(getEncode())).decode(varray.slice(0,100)))
            $('#preview').removeAttr('style')
                //轉換囉
            $('[data-start]').click(function() {
                $('#preview').attr('style', 'display:none')
                $('#loader').addClass("active indeterminate")
                let text = (new TextDecoder(getEncode())).decode(varray)
                convert(text)
            })
        }
        reader.readAsArrayBuffer(file);
    }
}

function getEncode() {
    let node = document.getElementById('encode');
    return node.options[node.selectedIndex].value;
}

function getByteLength(s) {
    return (new TextEncoder()).encode(s).length
}

async function splitText(t, maxTextLength, keywords = ['\n', '，', '。', ',', '.', ' '], convert = x => x) {
    for (let keyword of keywords) {
        let i = 0, arr = []
        while(i < t.length) {
            let index = t.lastIndexOf(keyword, i+maxTextLength-1)+1
            if (i == index) {
                arr.push(t.substring(i, Infinity))
                break;
            } else {
                arr.push(t.substring(i, index))
                i = index
            }
        }
        if (!(arr.every(x => x.length <= maxTextLength))) continue;
        let result = (await Promise.all(arr.map(convert))).join('')
        return result
    }
}

async function convert(t) {
    try {
        let maxTextLength = parseInt(((await axios.get('https://fhj.sciuridae.me/service-info')).data.data.maxPostBodyBytes)/4)
        let convert = async(x) => (await axios({
            method: 'post',
            url: 'https://fhj.sciuridae.me/convert',
            data: {
                converter: 'Taiwan',
                text: x
            }
        })).data.data.text

        let result = await splitText(t, maxTextLength, ['\n', '，', '。', ',', '.', ' '], convert)
        let data = new Blob([result], { type: 'text/plain;charset=utf-8;' });
        let url = URL.createObjectURL(data);

        $('#download').removeAttr('style')
        $('#download a').attr('href', url)
    } catch (error) {
        $('#error').removeAttr('style')
        $('#error p').text(error)
    }
    $('#loader').removeClass("active")
}