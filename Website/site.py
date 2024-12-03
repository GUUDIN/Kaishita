from flask import Flask, render_template_string, request, jsonify
import threading
import paho.mqtt.client as mqtt

# Variáveis globais para armazenar o valor recebido e a instância do cliente MQTT
latest_number = None
mqtt_client_instance = None

# Função para lidar com mensagens recebidas pelo MQTT
def on_message(client, userdata, msg):
    global latest_number
    latest_number = msg.payload.decode()  # Armazena a mensagem decodificada

# Configuração do cliente MQTT e conexão ao broker
def mqtt_client():
    global mqtt_client_instance
    client = mqtt.Client()
    client.on_message = on_message  # Define a função para tratar mensagens recebidas
    try:
        client.connect("andromeda.lasdpc.icmc.usp.br", 5012, 60)  # Conecta ao broker MQTT
        client.subscribe("peso")  # Inscreve-se no tópico MQTT
        mqtt_client_instance = client
        client.loop_forever()  # Mantém o cliente ouvindo mensagens
    except Exception as e:
        print(f"Erro ao conectar ao broker MQTT: {e}")

# Função para enviar mensagens MQTT sem bloquear o fluxo principal
def send_mqtt_message(topic, message):
    if mqtt_client_instance:
        try:
            mqtt_client_instance.publish(topic, message)  # Publica uma mensagem no tópico
        except Exception as e:
            print(f"Erro ao enviar mensagem MQTT: {e}")

# Inicialização do aplicativo Flask
app = Flask(__name__)

# Rota principal para exibir a interface do usuário
@app.route('/', methods=['GET'])
def index():
    """Renderiza a interface principal com o peso e botão de tara."""
    return render_template_string(f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Peso da Balança</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                color: #333;
                flex-direction: column;
            }}
            .container {{
                text-align: center;
                background: #ffffff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                padding: 2rem;
                border-radius: 8px;
            }}
            #weight {{
                font-size: 2rem;
                font-weight: bold;
                color: #333;
                margin-top: 1rem;
            }}
            button {{
                background-color: #007BFF;
                color: white;
                padding: 0.75rem 1.5rem;
                font-size: 1.25rem;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 1.5rem;
            }}
            button:hover {{
                background-color: #0056b3;
            }}
            img {{
                width: 150px;
                height: auto;
                margin-bottom: 1rem;
            }}
        </style>
        <script>
            // Função para enviar o comando de tara
            function sendTare() {{
                fetch('/tare', {{ method: 'POST' }})
                    .then(response => console.log("Tara enviada."))
                    .catch(error => console.error("Erro ao enviar tara:", error));
            }}

            // Função para buscar o peso atual periodicamente
            function fetchWeight() {{
                fetch('/get_weight')
                    .then(response => response.json())
                    .then(data => {{
                        document.getElementById("weight").innerText = data.weight || "Aguardando número...";
                    }})
                    .catch(error => console.error("Erro ao buscar peso:", error));
            }}

            // Atualiza o peso a cada 1 segundo
            setInterval(fetchWeight, 1000);
        </script>
    </head>
    <body>
        <div class="container">
            <img src="https://img.icons8.com/ios-filled/150/000000/scales.png" alt="Balança">
            <p id="weight">Aguardando número...</p>
            <button onclick="sendTare()">Tara</button>
        </div>
    </body>
    </html>
    """)

# Rota para lidar com o comando de tara
@app.route('/tare', methods=['POST'])
def tare():
    threading.Thread(target=send_mqtt_message, args=("tara", "ON")).start()  # Envia o comando de tara via MQTT
    return "", 204

# Rota para retornar o peso atual em formato JSON
@app.route('/get_weight', methods=['GET'])
def get_weight():
    return jsonify({"weight": latest_number})

# Função principal para iniciar o servidor Flask e o cliente MQTT
def start_server(port=5000):
    """Inicia o cliente MQTT e o servidor Flask."""
    mqtt_thread = threading.Thread(target=mqtt_client)  # Executa o cliente MQTT em uma thread separada
    mqtt_thread.daemon = True
    mqtt_thread.start()

    app.run(debug=True, use_reloader=False, host="0.0.0.0", port=port)  # Inicia o servidor Flask

if __name__ == "__main__":
    start_server(port=8080)
