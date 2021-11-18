# Force Terminate EC2
DISCLAIMER: We are not responsible for any damage from using this software.Please use it at your own risk and use it carefully.

Force delete EC2 instances with "termination protection" from any regions.

## Prerequisite
1. Nodejs [Download](https://nodejs.org/en/)

## Installation
1. Clone git `git clone https://github.com/unixxcorn/forceTerminateEC2.git`
2. Install package via npm:
```console
npm install
```
3. Create `credential.json` from this example:
```json
{
    "accessKeyId": "AKIAXXXXXXXX",
    "secretAccessKey": "IEXXXXXXXXXXXXXXXX"
}
```
4. Build program:
```console
npm run build
```
5. RUN:
```console
npm start
```
