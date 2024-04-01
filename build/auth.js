"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function auth(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //   get the token from the authorization header
            const token = yield ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
            if (!token)
                return res.status(401).send({
                    error: new Error('No auth token!')
                });
            //check if the token matches the supposed origin
            const decodedToken = yield jsonwebtoken_1.default.verify(token, process.env.SECRET_ACCESS_TOKEN);
            // retrieve the user details of the logged in user
            const user = yield decodedToken;
            // pass the the user down to the endpoints here
            req.user = user;
            // pass down functionality to the endpoint
            next();
        }
        catch (error) {
            res.status(401).json({
                error: new Error("Invalid req!"),
            });
        }
    });
}
exports.auth = auth;
