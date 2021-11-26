import LoginController from "../../app/controllers/LoginController.mjs";
export const auth=(api)=>{
    api.route.post('/login', LoginController.login)
}
