import axios from 'axios';
import LogicalException from "../../handlers/LogicalException.mjs";
import Storage from "../nucleo/Storage.mjs";
import FormData from "form-data";
import bigDecimal from 'js-big-decimal';
import fs from 'fs';
import path from 'path';
import WS from '../services/WS.mjs';
import https from 'https';
export default class SINGBOX {
    static async comprobarConexion() {
         try {
             const probarConexion = await axios.get(`${process.env.SINGBOX_URL}/api/echo?message=SIGNCLOUD_UP`);
             if (probarConexion.data === 'SIGNCLOUD_UP'){
                 return true;
             }else {
                 throw new LogicalException();
             }
         }catch (e) {
             console.log("ERROR", e);
             throw new LogicalException();
         }

    }
    static async singDocument(req, res) {
        await SINGBOX.comprobarConexion();
        try {
            const n_pag = req?.nPag;
            const documentUrl = 'https://www.orimi.com/pdf-test.pdf';
            const formData = new FormData();
            formData.append('url_in', documentUrl);
            formData.append('url_out', `https://api-webhookfirma.egob.sv/api/v1/guardarDocumento/057470638`);
            formData.append('urlback', 'https://api-webhookfirma.egob.sv/api/v1/webhook/057470638');
            formData.append('env', process.env.ENV_SING);
            formData.append('format', 'pades');
            formData.append('username', '1007186');
            formData.append('password', ';an6#q8y');
            formData.append('pin', 'qweqr353wrwr34');
            formData.append('level', 'BES');
            formData.append('billing_username', process.env.BILLING_USERNAME_COMPANY);
            formData.append('billing_password', process.env.BILLING_PASSWORD_COMPANY);
            formData.append('position', '10,6,310,6');
            formData.append('img_size', '606,569');
            formData.append("paragraph_format", `[
                {
                        "font": [
                            "Universal-Bold",
                            15
                        ],
                        "align": "right",
                        "data_format": {
                            "timezone": "America/El_Salvador",
                            "strtime": "%d/%m/%Y %H:%M:%S%z"
                        },
                        "format": [
                            "$(CN)s",
                            "$(serialNumber)s",
                            "$(O)s",
                            "$(OU)s",
                            "$(date)s"
                        ]
                    }
            ]`);
            formData.append('npage', 1);

            const cert = fs.readFileSync(`${process.cwd()}/cer.pem`);
            const key = fs.readFileSync(`${process.cwd()}/key.pem`);
            const agent = new https.Agent({
                cert: cert,
                key: key,
            });
            const response =await axios.post(`${process.env.SINGBOX_URL}/api/sign`, formData,{ httpsAgent: agent } );
            //console.log(response);
            console.log(response.data);
            if (response?.data?.exception === 'TypeError'){
                throw new LogicalException();
            }
            //setInterval (await SINGBOX.validarDocumento, 5000, response?.data?.id, res)
            //await SINGBOX.validarDocumento(response?.data?.id);
            const wsServer =  WS.getInstance();
            wsServer.emit('057470638', "VALIDANDO...");
            return res.status(200).json({message: 'ok'});
        }catch (e) {
            console.log("ERROR",e);
            throw new LogicalException();
        }
    }
    static async obtenerDocumento(req,res) {
/*         const image = await Storage.getFile("Documento31.pdf", 'local', req?.body?.numero_documento);
        return res.sendFile(image.getName(), { root: `storage/app/${req?.body?.numero_documento}` });
     */
        const filePath = path.join(process.cwd(), 'signbox-files',req.params.nombreDocumento);
/*
        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
            res.status(404).send('Archivo no encontrado');
            return;
        }

        // Leer el archivo y enviarlo como respuesta
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log("ERRPR", err);
                res.status(500).send('Error al leer el archivo');
                return;
            }
            res.contentType('application/pdf');
            res.send(data);
        }); */

        //descarga
         fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Error al cargar el archivo');
            } else {
                res.setHeader('Content-disposition', 'attachment; filename=file.pdf');
                res.setHeader('Content-Type', 'application/pdf');
                res.send(data);
            }
        });
    }
    static async webHook(req, res) {
        const wsServer =  WS.getInstance();
        const requestOrigin = req.get('origin'); // Obtener el encabezado 'Origin' si está presente
        console.log("Dirección IP del cliente:", requestOrigin);
        console.log("ENTRO" + "--" +req.params.numeroDocumento ,Object.keys(req.body).length);
        if (Object.keys(req.body).length === 0 ){
            try {
                wsServer.emit(req.params.numeroDocumento, "Se inicio canal...");
                return res.status(200).json({ message: "Canal creado." });
            }catch (e) {
                return res.status(500).json({ message: "No se creo canal." });
            }
        }
        const post = req.body;
        const line = post + '\n';
        const logFilePath = path.join(process.cwd(), 'signbox-files', `${new Date().toISOString().slice(0, 10)}.txt`);
        fs.appendFile(logFilePath, line, function (err) {
            console.log("OCURRIO UN ERROr", err)
            if (err) throw err;
        });
        //const wsServer =  WS.getInstance();
        //console.log("ANTES DE EMITIR", req.params);
        //console.log("ANTES DE EMITIR body", req.body);
        console.log("WEY ENTRE", req.body);
        wsServer.emit(req.params.numeroDocumento, req.body);
        return res.status(200).json({message: "funciona"});
    }
    static async guardarDocumento(req, res) {
        const requestOrigin = req.get('origin'); // Obtener el encabezado 'Origin' si está presente
        console.log("Dirección IP del cliente save doc:", requestOrigin);

        const wsServer = WS.getInstance();
        const chunks = [];

        req.on('data', (chunk) => {
            console.log("chunk", chunk);
            chunks.push(chunk);
        });

        req.on('end', () => {
            const data = Buffer.concat(chunks);
            const fileName = req.params.nombreDocumento; // nombre del archivo
            const filePath = path.join(process.cwd(), 'signbox-files/', fileName);

            fs.writeFile(filePath, data, (err) => {
                if (err) {
                    console.error("err", err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error al guardar archivo');
                    return;
                }

                // Tu lógica de manejo de éxito al guardar el archivo
                console.log("GUARDE EL DOCUMENTO");
                // Emisión del evento o cualquier otra lógica necesaria después de guardar

                // Esta línea se ejecutará después de que el archivo se guarde completamente
                console.log("DEBERIA FINALIZAR");
                wsServer.emit(req.params.nombreDocumento, { message: {
                        exception: 'ProcessTerminated'
                    } });
                // Enviar la respuesta al cliente después de guardar el archivo correctamente
                res.status(200).type('text/plain').send('Archivo guardado correctamente');
            });
        });
   }
    static async validarDocumento(responseID, res) {
        const id = new bigDecimal(responseID);
        const idToDecimal = parseFloat(id.value);
        const response = await axios.get(`${process.env.SINGBOX_URL}/api/job/${idToDecimal}`);
        console.log(response);
        if (response?.status) return res.status(400).json({pbsErrors: response, responseID: responseID})
        if (response?.data?.state === 'failed') return res.status(400).json({pbsErrors: response.data, responseID: responseID})
        /*         try {
                    if (response?.data?.state === 'failed'){
                        throw new LogicalException();
                    }
                    console.log("response validacion", response);
                }catch (e) {
                    console.log("EEROR",e);
                    throw new LogicalException();
                } */
    }

}





