const printer = require('printer')
const log = require('electron-log')

const CRLF = Buffer.from([0x0D, 0x0A])
const ESC_ALT = Buffer.from([0x1B, 0x40])
const HALF_CUT = Buffer.from([0x1B, 0x6D])

function printWithWPK835() {
    log.info('Start printWithWPK835')
    let data
	
    let s1 = 'AB112233441020523999900000144000001540000000001234567ydXZt4LAN1UHN/j1juVcRA==:**********:3:3:2:' + Buffer.from('乾電池').toString('base64')
    let s1_leng = s1.length + 3
    let s1_pl = (s1_leng % 256)
    let s1_ph = (s1_leng / 256)

    let s2 = '**' + Buffer.from(':1:105:口罩:1:210:牛奶:1:25').toString('base64')
    let s2_leng = s2.length + 3
    let s2_pl = (s2_leng % 256)
    let s2_ph = (s2_leng / 256)

    let qrcode = Buffer.concat([
        Buffer.from([0x1b, 0x02]) // 1.Page Mode
        , Buffer.from([0x1b, 0x61, 0x00]) // 2.Defines contents alignment, 0x00.Align left

        // QR Code 1
        , Buffer.from([0x1b, 0x24, 0x10, 0x00]) // 3.Moves the printing position absolutely along the row, 0x10=16
        , Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x76, 0x09]) // 4.Manually set QR code version.
        , Buffer.from([0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]) // 5.Select QR code model, 0x32=50(Model 2 conversion)
        , Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x03]) // 6.Set QR code model size.
        , Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x30]) // 7.Select QR code correction level
        , Buffer.concat([Buffer.from([0x1d, 0x28, 0x6b, parseInt(s1_pl), parseInt(s1_ph), 0x31, 0x50, 0x30]), Buffer.from(s1)]) // 8.Define data for QR Code
        , Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]) // 9.Print pre-rendered QR Code.
        , Buffer.from([0x1b, 0x4b, 0xa7]) // 10.167 (AC16=167 )

        // QR Code 2
        , Buffer.from([0x1b, 0x24, 0xd8, 0x00]) // 11.Moves the printing position absolutely along the row, 0xd8=216
        , Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x76, 0x09]) // 12.Manually set QR code version
        , Buffer.from([0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]) // 13.Select QR code model., 0x32=50(Model 2 conversion)
        , Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x03]) // 14.Set QR code model size.
        , Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x30]) // 15.Select QR code correction level
        , Buffer.concat([Buffer.from([0x1d, 0x28, 0x6b, parseInt(s2_pl), parseInt(s2_ph), 0x31, 0x50, 0x30]), Buffer.from(s2)]) // 16.Define data for QR Code.
        , Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]) // 17.Print pre-rendered QR Code.
        , Buffer.from([0x1b, 0x03]) // 18.Page Mode End
    ])
    log.info(qrcode)

    data = Buffer.concat([ESC_ALT,
        qrcode,
        HALF_CUT])

    log.debug(data)

    printer.printDirect({
        data: data,
        printer: get_print_name(),
        type: 'RAW',
        success: function(jobID){
            log.debug('sent to printer with ID: ' + jobID)
        },
        error:function(err){
            log.error(err)
        }

    })
    log.info('End printWithWPK835')
}

function printWithEP360C() {
    log.info('Start printWithEP360C')
    let data
	
    let s1 = 'AB112233441020523999900000144000001540000000001234567ydXZt4LAN1UHN/j1juVcRA==:**********:3:3:2:' + Buffer.from('乾電池').toString('base64')
    let s1_leng = s1.length
    let l1H = (s1_leng / 256)
    let l1L = (s1_leng % 256)

    let s2 = '**' + Buffer.from(':1:105:口罩:1:210:牛奶:1:25').toString('base64')
    let s2_leng = s2.length
    let l2H = (s2_leng / 256)
    let l2L = (s2_leng % 256)

    let qrcode = Buffer.concat([ESC_ALT
        // US   Q      m     n
        , Buffer.from([0x1f, 0x51, 0x02, 0x04])
        //p1H   p1L   l1H   l1L   ecc1  v1
        , Buffer.concat([Buffer.from([0, 64, parseInt(l1H), parseInt(l1L), 0, 6]), Buffer.from(s1)])
        //p2H   p2L   12H   l2L   ecc2  v2
        , Buffer.concat([Buffer.from([1, 64, parseInt(l2H), parseInt(l2L), 0, 6]), Buffer.from(s2)])
    ])
    log.info(qrcode)

    data = Buffer.concat([ESC_ALT,
        qrcode,
        HALF_CUT])

    log.debug(data)

    printer.printDirect({
        data: data,
        printer: get_print_name(),
        type: 'RAW',
        success: function(jobID){
            log.debug('sent to printer with ID: ' + jobID)
        },
        error:function(err){
            log.error(err)
        }

    })
    log.info('End printWithEP360C')
}

function print() {
    let printerNm = printer.getDefaultPrinterName()
    log.info('printerNm:'+printerNm)
	
    if(printerNm.indexOf('WP-K832') >= 0) {
		// WinPOS WP-K835V
        printWithWPK835()
    } else {
		// Xiamen Cashino EP-360C
        printWithEP360C()
    }
}