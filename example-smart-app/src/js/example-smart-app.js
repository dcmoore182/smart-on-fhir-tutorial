(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

      function onReady(smart)  {
          if (smart.hasOwnProperty('patient')) {
              var patient = smart.patient;
              var userName= smart.tokenResponse.username;
              var pt = patient.read();

              var obv = smart.patient.api.fetchAll({
                  type: 'Observation',
                  query: {
                      code: {
                          $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                              'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                              'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                      }
                  }
              });

              $.when(pt, obv).fail(onError);

              $.when(pt, obv, userName).done(function(patient, obv, user) {
                  var gender = patient.gender;
                  var dob = new Date(patient.birthDate);
                  var day = dob.getDate();
                  var monthIndex = dob.getMonth() + 1;
                  var year = dob.getFullYear();

                  var mrn=patient.identifier.find(i=>i.type.text=="MRN").value;

                  var dobStr = monthIndex + '/' + day + '/' + year;
                  var fname = '';
                  var lname = '';

                  if (typeof patient.name[0] !== 'undefined') {
                      fname = patient.name[0].given.join(' ');
                      lname = patient.name[0].family.join(' ');
                  }



                  var p = defaultPatient();
                  p.birthdate = dobStr;
                  p.gender = gender;
                  p.fname = fname;
                  p.lname = lname;
                  p.mrn=mrn;
                  p.userlogin=user;


                  ret.resolve(p);
              });
          } else {
              onError();
          }
      }

      FHIR.oauth2.ready(onReady, onError);
      return ret.promise();

  };



  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      mrn: {value: ''},
        userlogin: {value: ''},
    };
  }





  window.drawVisualization = function(p) {
      $('#holder').show();
      $('#loading').hide();
      $('#fname').html(p.fname);
      $('#lname').html(p.lname);
      $('#gender').html(p.gender);
      $('#birthdate').html(p.birthdate);
      $('#mrn').html(p.mrn);
      $('#userlogin').html(p.userlogin);

  };

})(window);
