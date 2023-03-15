import axios from 'axios';
import LogicalException from "../../handlers/LogicalException.mjs";
import Storage from "../nucleo/Storage.mjs";
import FormData from "form-data";
import bigDecimal from 'js-big-decimal';
import fs from 'fs';
import path from 'path';
export default class SINGBOX {
    static async comprobarConexion() {
         try {
             const probarConexion = await axios.get(`${process.env.SINGBOX_URL}/api/echo?message=SIGNCLOUD_UP`);
             if (probarConexion.data === 'SIGNCLOUD_UP'){
                 console.log("PASE VALIDACION");
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
            const documentUrl = 'https://download.hightech-corp.com/fel/clientes-prueba/sample.pdf';
            const formData = new FormData();
            formData.append('url_in', documentUrl);
            formData.append('url_out', `https://api-webhookfirma.egob.sv/api/v1/guardarDocumento`);
            formData.append('urlback', 'https://api-webhookfirma.egob.sv/api/v1/webhook');
            formData.append('env', process.env.ENV_SING);
            formData.append('format', 'pades');
            formData.append('username', '1009555');
            formData.append('password', '7qq926yk');
            formData.append('pin', 'reereer232QQW');
            formData.append('level', 'BES');
            formData.append('billing_username', process.env.BILLING_USERNAME_COMPANY);
            formData.append('billing_password', process.env.BILLING_PASSWORD_COMPANY);
            formData.append('position', '275,182,575,241');
            formData.append('img_name', 'logo_firma.argb');
            formData.append('img_size', '606,569');
            formData.append("paragraph_format", `[
                {
                    "font" : ["Universal-Bold",15],
                    "align":"right",
                    "data_format" : { "timezone":"Europe/Madrid", "strtime":"%d/%m/%Y %H:%M:%S%z"},
                    "format": [
                        "Firmado por:","$(CN)s","$(serialNumber)s","Fecha: $(date)s"
                    ]
                }
            ]`);
            formData.append('npage', (n_pag-1));

            const response =await axios.post(`${process.env.SINGBOX_URL}/api/sign`,formData);
            if (response?.data?.exception === 'TypeError'){
                throw new LogicalException();
            }
            //setInterval (await SINGBOX.validarDocumento, 5000, response?.data?.id, res)
            //await SINGBOX.validarDocumento(response?.data?.id);
            return res.status(200).json({message: 'ok'});
        }catch (e) {
            console.log(e);
            throw new LogicalException();
        }
    }
    static async obtenerDocumento(req,res) {
/*         const image = await Storage.getFile("Documento31.pdf", 'local', req?.body?.numero_documento);
        return res.sendFile(image.getName(), { root: `storage/app/${req?.body?.numero_documento}` });
     */
        const filePath = path.join(process.cwd(), 'signbox-files/');

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
        });

    }
    static async webHook(req, res) {
        console.log("LISTEN WEBHOOK", req)
    }
    static async guardarDocumento(req, res) {
        console.log("LLEGE");

    /*     const uploadedFile = await Storage.disk('documents').put({
            file: req.file,
            mimeTypes: ['application/pdf'],
        }); */
/*         const data = req.body;
        const fileName = `webhook_${new Date().getTime()}.json`;
        fs.writeFile(fileName, JSON.stringify(data), err => {
            if (err) {
                console.log(err);
                throw err
            };
            console.log(`Datos guardados en ${fileName}`);
        });
        return res.status(200); */


      try {
          const post = req.body;
          const filePath = path.join(process.cwd(), 'signbox-files/');

          // Verificar si el directorio existe, si no, crearlo
          if (!fs.existsSync(filePath)) {
              fs.mkdirSync(filePath);
          }

          const file_handle = fs.openSync(path.join(filePath, 'file.pdf'), 'w');
          const data = JSON.stringify(post); // Convertir objeto a cadena JSON
          fs.writeSync(file_handle, data);
          fs.closeSync(file_handle);


    /*
          console.log("POST", post);
          const filePath = path.join(process.cwd(), 'signbox-files/');
          console.log("FILEPAT", filePath);
          const postString = JSON.stringify(post);
          const postBuffer = Buffer.from(postString);
          console.log("postBuffer",postBuffer);
          console.log("postString",postString);
          if (!fs.existsSync(filePath)) {
              fs.mkdirSync(filePath);
          }
          const file_handle = fs.openSync(path.join(filePath, 'file.pdf'), 'w');
          fs.writeSync(file_handle, post);
          fs.closeSync(file_handle); */
/*           fs.writeFile(filePath, postBuffer, function (err) {              console.log("ERR", err);
              if (err) {
                  console.error("ERROR",err);
                  res.status(500).send('Error al escribir el archivo');
              } else {
                  console.log("EXITO",'Archivo guardado correctamente');
                  res.send('Archivo guardado correctamente');
              }
          }); */
      }catch (e) {
          console.log("ERROR", e);
      }
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
