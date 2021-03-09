const { Wechaty } = require('wechaty');
const { ScanStatus } = require('wechaty-puppet');
const QrcodeTerminal = require('qrcode-terminal');

const token = 'puppet_donut_1abc60ff793d190d';

const bot = new Wechaty({
    puppet: 'wechaty-puppet-hostie',
    puppetOptions: {
        token,
    }
});

bot
    .on('scan', (qrcode, status) => {
        if (status === ScanStatus.Waiting) {
            QrcodeTerminal.generate(qrcode, {
                small: true
            });
        }
    })
    .on('login', async user => {
        console.log(`user: ${JSON.stringify(user)}`);
    })
    .on('message', async message => {
        console.log(`message: ${JSON.stringify(message)}`);
    })
    .start();