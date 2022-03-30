function Common(){
    Common.prototype.isConnected = function(req){
        if(req.session){
            if(req.session.user_id){
                return true
            }
        }
        return false
    }
    
    Common.prototype.error = function(err, res){
        console.log(err)
        res.render('error',{error:err});
    }
}
module.exports = new Common();