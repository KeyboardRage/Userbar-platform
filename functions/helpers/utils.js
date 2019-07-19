
// Helper function to retrieve the correct Redirect URI for development/production
function getDiscordRedirectUri(host) {
    if(host === "localhost:5001") {
        // If accessed on local host return local host redirect uri
        // TODO:
        //  Remove this when the app is truly production ready.
        //  Or make another firebase project and use a environment variable.
        return "http://localhost:5001/userbars-46279/us-central1/app/api/authn/login";
    } else {
        return "https://userbars-46279.web.app/api/authn/login";
    }
}

// Helper function to retrieve the correct OAuth URL
function getDiscordOauthUrl(host) {
    if(host === "localhost:5001") {
        // If accessed on local host return local host oauth uri
        // TODO:
        //  Remove this when the app is truly production ready.
        //  Or make another firebase project and use a environment variable.
        return "https://discordapp.com/api/oauth2/authorize?client_id=601822687144312989&redirect_uri=http%3A%2F%2Flocalhost%3A5001%2Fuserbars-46279%2Fus-central1%2Fapp%2Fapi%2Fauthn%2Flogin&response_type=code&scope=identify";
    } else {
        return "https://discordapp.com/api/oauth2/authorize?client_id=601822687144312989&redirect_uri=https%3A%2F%2Fuserbars-46279.web.app%2Fapi%2Fauthn%2Flogin&response_type=code&scope=identify";
    }  
}


module.exports.getDiscordRedirectUri = getDiscordRedirectUri;
module.exports.getDiscordOauthUrl = getDiscordOauthUrl;