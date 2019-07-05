// Punto 1.- Hace que el título cambie de color
$(function(){
var x = false;
setInterval(function() {
    $(".main-titulo").css("color", x ? "white" : "yellow");
    x = !x;
}, 500);

var columnas = $(".panel-tablero").children(),
    grupos = [];
    score = 0;

//Punto 2.- Agrega los dulces al tablero
function addCandy(){
  result = false;
  if (columnas[0].children.length) { //Entra si ya hay dulces en el tablero
    console.log("Ya hay dulces");
    for (var i = 0; i < columnas.length; i++) {
      while (columnas[i].children.length <= 5) {
        var dulce = 1 + Math.floor(Math.random() * 4); //Genera número aleatorio
        var nuevaImagen = $('<img>', {"src": "image/" + dulce + ".png"});
        $(columnas[i]).prepend(nuevaImagen); //Prepend para que se añadan al inicio del arreglo
        }
      }
    }
  else{
    for (var i = 0; i < columnas.length; i++) {
      if (columnas[i].children.length <= 5) {
        for (var j = 0; j <= 5; j++) {
          var dulce = 1 + Math.floor(Math.random() * 4);
          var nuevaImagen = $('<img>', {"src": "image/" + dulce + ".png"});
          $(columnas[i]).append(nuevaImagen);
        }
      }
    }
  }
  findGroups();
}

//Punto 3.- Revisa si hay mas de 3 dulces seguidos para eliminarlos
function findGroups(){
  swap();
    grupos = []
    //Busca grupos de piezas iguales por columna
    for (var i = 0; i < columnas.length; i++) {
      var matchlength = 1;
      for (var j = 0; j < columnas[j].children.length; j++) {
        var checkGroup = false;
        if (j == columnas[j].children.length - 1) {
          checkGroup = true;
        }else{
          if (columnas[i].children[j].getAttribute("src") ==
              columnas[i].children[j+1].getAttribute("src")) {
            matchlength += 1;
          }else {
            checkGroup = true;
          }
        }
        if (checkGroup) {
          if (matchlength >= 3) {
            console.log("Hay un grupo vertical de " + matchlength + " dulces");
            puntaje(matchlength);
            grupos.push({column: i, row: j+1-matchlength,
                          length: matchlength, horizontal: false}); //Se agrega al arreglo grupos
          }
          matchlength = 1;
        }
      }
    }
    //Busca grupos de piezas iguales por fila
    for (var j = 0; j < columnas[j].children.length; j++) {
      var matchlength = 1;
      for (var i = 0; i < columnas.length; i++) {
        var checkGroup = false;
        if (i == columnas.length - 1) {
          checkGroup = true;
        }else{
          if (columnas[i].children[j].getAttribute("src") ==
              columnas[i+1].children[j].getAttribute("src")) {
            matchlength += 1;
          }else {
            checkGroup = true;
          }
        }
        if (checkGroup) {
          if (matchlength >= 3) {
            console.log("Hay un grupo horizontal de " + matchlength + " dulces");
            puntaje(matchlength);
            grupos.push({column: i+1-matchlength, row: j,
                          length: matchlength, horizontal: true});
          }
          matchlength = 1;
        }
      }
    }
    resolveGroups();
}

function puntaje(matchlength){ //Determina los puntos a sumar según de cuantas piezas sea el grupo
  if (matchlength == 3) {
    score = score + 30;
    $("#score-text").text(score);
  }else if (matchlength == 4) {
    score = score + 60;
    $("#score-text").text(score);
  }else if (matchlength == 5) {
    score = score + 100;
    $("#score-text").text(score);
  }else if (matchlength == 6) {
    score = score + 150;
  }else{
    score = score + 210;
  }
}

function resolveGroups(){
  if (grupos.length > 0) { //Entra si hay grupos
    removeGroup(); //Borra los grupos
  }
}

function removeGroup(){
  loopGroups(function(index,col,row, grupo){
    $(columnas[col].children[row]).addClass("delete"); //Asigna la clase delete a los dulces que se van a eliminar
  });
  console.table(grupos);
  $(".delete").effect("pulsate", function(){
    $(".delete").remove();
  });
  deletesCandy()
    .then(addCandy) //Agrega mas dulces cuando ya se elimianron los anteriores
    .catch(showPromiseError);
}

function loopGroups(func){
  for (var i = 0; i < grupos.length; i++) {
    var grupo = grupos[i],
        coffset = 0,
        roffset = 0;

    for (var j = 0; j < grupo.length; j++) {
      func(i, grupo.column+coffset, grupo.row+roffset, grupo);
      if (grupo.horizontal) {
        coffset++;
      }else {
        roffset++;
      }
    }
  }
}


function deletesCandy(){
  return new Promise(function (resolve, reject) { // Promesa para esperar a que se eliminen los dulces en la funcion removeGroup
    setTimeout(() =>{
      if ($('.delete').length == 0) {
  			resolve();
  		} else {
  			reject('No se pudo eliminar...');
  		}
    },1000);
  	})
}

function showPromiseError(error) {
	console.log(error);
}

function gameOver(){ //Cuando termina el juego
  $(".panel-tablero, .time").effect('fold');
  $(".panel-score").before("<h1 class='titulo-over'>Juego Terminado</h1>");
  $(".panel-score").css("width", "100%");
  $(".score, .moves").css("height", "35%");
  $(".score, .moves").css("font-size", "30px");
}

function swap(){ //Se establecen los parámetros para drag & drop
  for (var i = 0; i < columnas.length; i++) {
    for (var j = 0; j < columnas[j].children.length; j++) {
      $(columnas[i].children[j]).draggable({
        containment: ".panel-tablero",
        revert: true,
        // grid: [50,50],
        zIndex: 10,
        drag: constrainCandyMovement
      });
      if (columnas[i].children == columnas[0].children) { //Entra si es la primera columna
        var primera = [columnas[i+1].children[j], columnas[i].children[j+1], columnas[i].children[j-1]]
          $(columnas[i].children[j]).droppable({
            accept: primera,
            drop: moveCandy
        });
      }else if (columnas[i].children == columnas[6].children) { //Entra si es la última columna
          var ultima = [columnas[i-1].children[j], columnas[i].children[j+1], columnas[i].children[j-1]]
          $(columnas[i].children[j]).droppable({
            accept: ultima,
            drop: moveCandy
        });
      }else {
          var aceptar = [columnas[i-1].children[j], columnas[i+1].children[j], columnas[i].children[j+1], columnas[i].children[j-1]];
          $(columnas[i].children[j]).droppable({
            accept: aceptar,
            drop: moveCandy
        });
      }
    }
  }
}

//Delimita cuanto puede moverse un dulce
function constrainCandyMovement(event, candyDrag) {
	candyDrag.position.top = Math.min(120, candyDrag.position.top);
	candyDrag.position.top = Math.max(-120, candyDrag.position.top);
	candyDrag.position.left = Math.min(130, candyDrag.position.left);
	candyDrag.position.left = Math.max(-130, candyDrag.position.left);
}


function moveCandy(event, candyDrag){ //Intercambia las posiciones de los dulces
  moves = 0;
  var candyDrag = $(candyDrag.draggable);
  var dragSrc = candyDrag.attr('src');
  var candyDrop = $(this);
  var dropSrc = candyDrop.attr('src');
  candyDrag.attr('src', dropSrc);
  candyDrop.attr('src', dragSrc);
  findGroups();
  if (grupos.length == 0) { //Si no hay ningún grupo, no pasa nada
    candyDrag.attr('src', dragSrc);
    candyDrop.attr('src', dropSrc);
  }else {
    var valorActual = Number($("#movimientos-text").text());
    moves = valorActual += 1;
    $("#movimientos-text").text(moves);
  }
}

function init(){
  $(".btn-reinicio").click(function(){
    if ($(this).text() === "Iniciar") {
      $(this).text("Reiniciar");
      $('#timer').startTimer({
        onComplete: gameOver
      });
      addCandy();
    }else {
      location.reload();
    }
  });

}


init();
});
