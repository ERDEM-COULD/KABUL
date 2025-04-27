const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// IP ve cihaz bilgisi kaydetme endpointi
app.post('/api/save-info', (req, res) => {
  const { ip, deviceInfo } = req.body;

  if (!ip || !deviceInfo) {
    return res.status(400).json({ message: 'IP ve cihaz bilgisi gerekli.' });
  }

  const packageJsonPath = path.join(__dirname, 'package.json');
  const deviceInfoPath = path.join(__dirname, 'device-info.json');

  try {
    // Önce IP'yi package.json'daki "ane" alanına yazıyoruz
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageData.ane = ip;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2));
    console.log(`package.json içine IP kaydedildi: ${ip}`);

    // Sonra cihaz bilgisini ayrı bir JSON dosyasına kaydediyoruz
    let deviceData = [];

    if (fs.existsSync(deviceInfoPath)) {
      deviceData = JSON.parse(fs.readFileSync(deviceInfoPath, 'utf8'));
    }

    deviceData.push({
      ip,
      deviceInfo,
      timestamp: new Date().toISOString()
    });

    fs.writeFileSync(deviceInfoPath, JSON.stringify(deviceData, null, 2));
    console.log(`device-info.json içine cihaz bilgisi kaydedildi.`);

    res.json({ message: 'IP ve cihaz bilgisi başarıyla kaydedildi.' });
  } catch (err) {
    console.error('Dosya işlemi sırasında hata:', err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Railway için port ayarı
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif! 🚀`);
});
