# Machine à Sirops Explora

Docker image for running rpi-top (machine à sirops) on a Raspberry Pi.

## Usage

Clone this repository to your local machine:



```bash
git clone https://github.com/heia-fr/machine-a-sirops-explora.git

cd machine-a-sirops-explora
```

Start the services with Docker Compose:

```bash
docker-compose -f docker/compose.yaml up
```

Open a first brower window for the rpi-top interface:

http://127.0.0.1:1880/dashboard/main

Open a second browser window for the main display

http://127.0.0.1:8000/?B=ws://127.0.0.1:8090&T=heiafr/ms/top/

If you want to change the Node-RED configuration, open:

http://127.0.0.1:1880
