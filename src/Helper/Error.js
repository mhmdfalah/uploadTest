const handleError =(msg="Oops! Something went wrong!",res)=>{

   return res.status(400).json({error:msg});
  };

  
  module.exports = {
      handleError
  }