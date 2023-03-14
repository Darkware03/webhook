import axios from 'axios';
import LogicalException from "../../handlers/LogicalException.mjs";
import Storage from "../nucleo/Storage.mjs";
import FormData from "form-data";
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
        console.log("ENTRO");
        await SINGBOX.comprobarConexion();
        try {
            const n_pag = req?.nPag;
            const documentUrl = 'https://download.hightech-corp.com/fel/clientes-prueba/sample.pdf';
            const formData = new FormData();
            formData.append('url_in', documentUrl);
            formData.append('urlback', `${process.env.HOST}:${process.env.PORT}/api/v1/listen`);
           // formData.append('urlback', 'http://localhost:8005/api/v1/listen');
            formData.append('env', process.env.ENV_SING);
            formData.append('format', 'pades');
            formData.append('username', '1122338');
            formData.append('password', '7T8xdGBN');
            formData.append('pin', 'w98nZZDR');
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
            setInterval (await SINGBOX.validarDocumento, 5000, response?.data?.id)
            //return res.status(200).json({message: 'ok'});
        }catch (e) {
            console.log(e);
            throw new LogicalException();
        }
    }

    static async obtenerDocumento(req,res) {
        const image = await Storage.getFile("Documento31.pdf", 'local', req?.body?.numero_documento);
        return res.sendFile(image.getName(), { root: `storage/app/${req?.body?.numero_documento}` });
    }

    static async listen(req) {
        console.log("LISTEN", req)
    }
    static async validarDocumento(responseID) {
        try {
            console.log(responseID);
            const response = await axios.get(`${process.env.SINGBOX_URL}/api/job/${responseID}`);
            if (response?.data?.state === 'failed'){
                throw new LogicalException();
            }
            console.log("response validacion", response?.data);
            return response;
        }catch (e) {
            console.log(e);
            throw new LogicalException();
        }
    }

}
