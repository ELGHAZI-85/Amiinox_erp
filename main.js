const {app , BrowserWindow} = require('electron')

const url = require('url')
const path = require('path')

const createWindow = () => {
    const win = new BrowserWindow(
        {
            title : 'AmiinoxErp',
            width : 800,
            height : 600
        }
    )

    const startUrl = url.format(
        {
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file'
        }
    )

    win.loadURL(startUrl)

}

app.whenReady().then(() => {
    createWindow()  
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

