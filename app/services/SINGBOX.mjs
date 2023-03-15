import axios from 'axios';
import LogicalException from "../../handlers/LogicalException.mjs";
import Storage from "../nucleo/Storage.mjs";
import FormData from "form-data";
import bigDecimal from 'js-big-decimal';
import fetch from 'node-fetch';
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
        const image = await Storage.getFile("Documento31.pdf", 'local', req?.body?.numero_documento);
        return res.sendFile(image.getName(), { root: `storage/app/${req?.body?.numero_documento}` });
    }

    static async webHook(req, res) {
        console.log("LISTEN WEBHOOK", req)
    }
    static async guardarDocumento(req, res) {
        const data = req.body;
        console.log("LISTEN Guardar DOC", data)
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
