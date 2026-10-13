
const expresion = document.getElementById("expresion");
const btnGenerar = document.getElementById("btnGenerar");
const btnLimpiar = document.getElementById("btnLimpiar");

const tablaTriplos = document.getElementById("tablaTriplos");
const tablaCuadruplos = document.getElementById("tablaCuadruplos");
const mensaje = document.getElementById("mensaje");

// Mostrar mensajes en pantalla
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "text-center " + tipo;
}

// Limpiar las tablas
function limpiarTablas() {
    tablaTriplos.innerHTML = "";
    tablaCuadruplos.innerHTML = "";
}

// Separar la expresion en tokens
function obtenerTokens(exp) {
    const patron =
        /(?:\d+(?:\.\d+)?|\.\d+)|(?:[a-zA-Z_][a-zA-Z0-9_]*)|[+\-*/()]/g;

    const tokens = exp.match(patron) || [];

    // Verificar que no existan caracteres invalidos
    const original = exp.replace(/\s/g, "");
    const reconstruida = tokens.join("");

    if (original !== reconstruida) {
        throw new Error("La expresion contiene caracteres no validos.");
    }

    return tokens;
}

// Obtener la prioridad de cada operador
function obtenerPrioridad(op) {
    if (op === "u+" || op === "u-") return 3;
    if (op === "*" || op === "/") return 2;
    if (op === "+" || op === "-") return 1;

    return 0;
}

// Convertir la expresion a notacion postfija
function convertirPostfija(tokens) {
    const salida = [];
    const pila = [];

    let esperarOperando = true;

    for (const token of tokens) {
        if (/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(token) ||
            /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {

            if (!esperarOperando) {
                throw new Error("Falta un operador entre los operandos.");
            }

            salida.push(token);
            esperarOperando = false;

        } else if (token === "(") {

            if (!esperarOperando) {
                throw new Error("Falta un operador antes del parentesis.");
            }

            pila.push(token);
            esperarOperando = true;

        } else if (token === ")") {

            if (esperarOperando) {
                throw new Error("Revisa el contenido de los parentesis.");
            }

            while (pila.length > 0 &&
                   pila[pila.length - 1] !== "(") {
                salida.push(pila.pop());
            }

            if (pila.length === 0) {
                throw new Error("Hay un parentesis de cierre sin pareja.");
            }

            pila.pop();
            esperarOperando = false;

        } else {
            let operador = token;

            // Permitir signos unarios, por ejemplo: -a o -5
            if (esperarOperando) {
                if (token === "+") {
                    operador = "u+";
                } else if (token === "-") {
                    operador = "u-";
                } else {
                    throw new Error("La expresion tiene operadores incorrectos.");
                }
            } else {
                esperarOperando = true;
            }

            const prioridad = obtenerPrioridad(operador);

            while (pila.length > 0 &&
                   pila[pila.length - 1] !== "(") {

                const cima = pila[pila.length - 1];
                const prioridadCima = obtenerPrioridad(cima);

                const esAsociativoDerecha =
                    operador === "u+" || operador === "u-";

                if (
                    prioridadCima > prioridad ||
                    (prioridadCima === prioridad &&
                     !esAsociativoDerecha)
                ) {
                    salida.push(pila.pop());
                } else {
                    break;
                }
            }

            pila.push(operador);
        }
    }

    if (esperarOperando) {
        throw new Error("La expresion esta incompleta.");
    }

    while (pila.length > 0) {
        const operador = pila.pop();

        if (operador === "(") {
            throw new Error("Hay un parentesis de apertura sin pareja.");
        }

        salida.push(operador);
    }

    return salida;
}

// Generar los triplos y cuádruplos
function generarCodigo(exp) {
    exp = exp.trim();

    if (exp === "") {
        throw new Error("Ingresa una expresion matemática.");
    }

    let destino = null;
    let parteExpresion = exp;

    // Detectar una asignación, por ejemplo: r = a + b
    const cantidadIguales = (exp.match(/=/g) || []).length;

    if (cantidadIguales > 1) {
        throw new Error("Solo se permite una asignacion.");
    }

    if (cantidadIguales === 1) {
        const partes = exp.split("=");

        destino = partes[0].trim();
        parteExpresion = partes[1].trim();

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(destino)) {
            throw new Error("El destino de la asignación no es válido.");
        }

        if (parteExpresion === "") {
            throw new Error("Falta la expresión que se va a asignar.");
        }
    }

    const tokens = obtenerTokens(parteExpresion);
    const postfija = convertirPostfija(tokens);

    const pila = [];
    const triplos = [];
    const cuadruplos = [];

    let contadorTemporal = 1;

    for (const token of postfija) {

        // Si es un número o una variable
        if (
            /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(token) ||
            /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)
        ) {
            pila.push({
                triplo: token,
                cuadruplo: token
            });

        } else {
            const esUnario = token === "u+" || token === "u-";

            if (esUnario) {
                if (pila.length < 1) {
                    throw new Error("Falta un operando.");
                }
            } else if (pila.length < 2) {
                throw new Error("Faltan operandos para una operación.");
            }

            let argumento1;
            let argumento2 = "—";
            let operador = token;

            if (esUnario) {
                argumento1 = pila.pop();
                operador = token === "u-" ? "u-" : "u+";
            } else {
                argumento2 = pila.pop();
                argumento1 = pila.pop();
            }

            const numeroTriplo = triplos.length;
            const temporal = "T" + contadorTemporal++;

            triplos.push({
                numero: numeroTriplo,
                operador: operador,
                argumento1: argumento1.triplo,
                argumento2: esUnario ? "—" : argumento2.triplo
            });

            cuadruplos.push({
                numero: cuadruplos.length,
                operador: operador,
                argumento1: argumento1.cuadruplo,
                argumento2: esUnario ? "—" : argumento2.cuadruplo,
                resultado: temporal
            });

            // En triplos se referencia el número de la operación.
            // En cuádruplos se utiliza una variable temporal.
            pila.push({
                triplo: "(" + numeroTriplo + ")",
                cuadruplo: temporal
            });
        }
    }

    if (pila.length !== 1) {
        throw new Error("No se pudo completar el analisis de la expresion.");
    }

    const resultado = pila.pop();

    // Agregar la asignación como última operación
    if (destino !== null) {
        triplos.push({
            numero: triplos.length,
            operador: "=",
            argumento1: resultado.triplo,
            argumento2: destino
        });

        cuadruplos.push({
            numero: cuadruplos.length,
            operador: "=",
            argumento1: resultado.cuadruplo,
            argumento2: "—",
            resultado: destino
        });
    }

    return {
        triplos: triplos,
        cuadruplos: cuadruplos
    };
}

// Insertar los resultados en las tablas
function mostrarResultados(resultados) {
    limpiarTablas();

    resultados.triplos.forEach(function (fila) {
        const tr = document.createElement("tr");

        [
            fila.numero,
            fila.operador,
            fila.argumento1,
            fila.argumento2
        ].forEach(function (dato) {
            const td = document.createElement("td");
            td.textContent = dato;
            tr.appendChild(td);
        });

        tablaTriplos.appendChild(tr);
    });

    resultados.cuadruplos.forEach(function (fila) {
        const tr = document.createElement("tr");

        [
            fila.numero,
            fila.operador,
            fila.argumento1,
            fila.argumento2,
            fila.resultado
        ].forEach(function (dato) {
            const td = document.createElement("td");
            td.textContent = dato;
            tr.appendChild(td);
        });

        tablaCuadruplos.appendChild(tr);
    });
}

// Boton para generar las tablas
btnGenerar.addEventListener("click", function () {
    try {
        const resultados = generarCodigo(expresion.value);

        mostrarResultados(resultados);

        mostrarMensaje(
            "¡Triplos y cuadruplos generados correctamente!",
            "text-success"
        );

    } catch (error) {
        limpiarTablas();

        tablaTriplos.innerHTML =
            '<tr><td colspan="4">No se generaron resultados.</td></tr>';

        tablaCuadruplos.innerHTML =
            '<tr><td colspan="5">No se generaron resultados.</td></tr>';

        mostrarMensaje(error.message, "text-danger");
    }
});

// Botón para limpiar el formulario
btnLimpiar.addEventListener("click", function () {
    expresion.value = "";
    limpiarTablas();

    tablaTriplos.innerHTML =
        '<tr><td colspan="4">Ingresa una expresion para generar los triplos.</td></tr>';

    tablaCuadruplos.innerHTML =
        '<tr><td colspan="5">Ingresa una expresion para generar los cuadruplos.</td></tr>';

    mostrarMensaje("", "");
    expresion.focus();
});
