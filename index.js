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
            $('#preview pre').text((new TextDecoder(getEncode())).decode(varray.slice(0, 96)))
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

async function splitText(t, maxTextLength, convert = x => x) {
    const keywords = ['\n', '，', '。','；','：','、','？', ',', '.', ' '];
    
    // Split into tiny chunks
    let splitted = [t];
    while(splitted.some(x => x.length > maxTextLength)) {
        for(let i = 0; i < splitted.length; i++) {
            if(splitted[i].length > maxTextLength) {
                for(const keyword of keywords){
                    if (
                        splitted[i].includes(keyword) &&
                        splitted[i].split(keyword).filter(x => x).length > 1
                    ){
                        splitted[i] = splitted[i].split(keyword);
                        for(let j = 0; j < splitted[i].length - 1; j++){
                            splitted[i][j] += keyword;
                        }
                        break;
                    }
                }
            }
        }
        splitted = splitted.flat();
    }

    // Merge to maximum chunks
    for(let i = 0; i+1 < splitted.length; i++) {
        if (splitted[i].length + splitted[i+1].length <= maxTextLength) {
            splitted[i] += splitted[i+1];
            splitted.splice(i+1, 1);
            i--;
        }
    }

    // Prevent 429 Error
    let result = "";
    for(const s of splitted) {
        result += await convert(s);
    }
    return result;
}

async function convert(t) {
    try {
        let isIOS = navigator.userAgent.toLowerCase().match(/(iPad|iPhone|iPod)/i);
        let maxTextLength = parseInt(((await axios.get('https://zhc.rextw.com/service-info')).data.data.maxPostBodyBytes)/4)
        let _convert = async(x) => (await axios({
            method: 'post',
            url: 'https://zhc.rextw.com/convert',
            data: {
                converter: 'Taiwan',
                text: x
            }
        })).data.data.text

        let result = await splitText(t, maxTextLength, _convert)
        let data = new Blob([result], { type: isIOS ? 'application/octet-stream' :'text/plain;charset=utf-8;' });
        let url = URL.createObjectURL(data);

        $('#download').removeAttr('style')
        $('#download a').attr('href', url)
    } catch (error) {
        $('#error').removeAttr('style')
        $('#error p').text(error)
    }
    $('#loader').removeClass("active")
}
