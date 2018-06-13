'use strict';

import express from 'express';
const router = express.Router();

// 'nel' module to run code
import nel from 'nel';
const session = new nel.Session();

// Dynamic Models
// This will use a model matching /:model/ in all routes that have a model parameter
import modelFinder from '../middleware/models.js';
router.param('model', modelFinder);

// Each of our REST endpoints simply calls the model's appropriate CRUD Method (only give the students GET and POST for now)
// In all cases, we just catch(next), which feeds any errors we get into the next() as a param
// This fires off the error middleware automatically.  Otherwise, we send out a formatted JSON Response

router.get('/api/v1/:model', (req,res,next) => {
  req.model.find({})
    .then( data => sendJSON(res,data) )
    .catch( next );
});

router.get('/api/v1/:model/:id', (req,res,next) => {
  req.model.findOne({_id:req.params.id})
    .then( data => sendJSON(res,data) )
    .catch( next );
});

router.post('/api/v1/:model', (req,res,next) => {
  let record = new req.model(req.body);
  record.save()
    .then( data => sendJSON(res,data) )
    .catch( next );
});

router.put('/api/v1/:model/:id', (req, res, next) => {
  req.model.findByIdAndUpdate(req.params.id, req.body)
    .then(data => sendJSON(res, data))
    .catch(next);
});

router.delete('/api/v1/:model/:id', (req, res, next) => {
  req.model.findByIdAndDelete(req.params.id)
    .then(data => sendJSON(res, data))
    .catch(next);
});

// Route with single responsibility to test code
router.post('/api/v1/code', (req, res) => {

  const solution = {};
  let code = req.body.code.trim();

  session.execute(code, {
    onSuccess: (output) => {
      solution.onSuccess = output;
    },
    onError: (output) => {
      solution.onError = output;
    },
    onStdout: (output) => {
      solution.onStdout = output.trim();
    },
    onStderr: (output) => {
      solution.onStderr = output;
    },
    afterRun: () => {
      sendJSON(res, solution);
    },
  });
});


let sendJSON = (res,data) => {
  res.statusCode = 200;
  res.statusMessage = 'OK';
  res.setHeader('Content-Type', 'application/json');
  res.write( JSON.stringify(data) );
  res.end();
};

export default router;
