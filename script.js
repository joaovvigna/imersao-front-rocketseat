const apiKeyInput = document.getElementById('apiKey');
const gameSelected = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
}

// função que pergunta a AI e recebe a resposta
const perguntarAI = async (question, game, apiKey) => {

    // monta a url da API onde sera enviada a pergunta
    const model = "gemini-2.5-flash";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // prompt com a pergunta para a AI responder
    const agenteValorant = `
        ## Especialidade
        Você é um assistente especialista em estratégias, agentes, composições e meta competitivo de **Valorant**.

        ## Tarefa
        Responda às perguntas do usuário com informações precisas e atualizadas sobre Valorant.

        ## Regras
        - Se não souber com certeza, pesquise antes ou responda "Não sei".
        - Se a pergunta não for sobre Valorant, diga: **"Essa pergunta não é sobre o jogo."**
        - Use a data atual: **${new Date().toLocaleDateString('pt-BR')}**
        - Sempre busque fontes atualizadas da web (patch notes, sites oficiais, rankings, etc).
        - Nunca invente respostas.

        ## Resposta
        - Seja direto e use **no máximo 500 caracteres**.
        - Formate em **Markdown**.
        - Destaque **agentes, habilidades, armas, mapas, estratégias**.
        - Não adicione introduções ou encerramentos.

        ## Exemplo
        **Pergunta do usuário:** Melhor agente para Pearl?

        **Resposta:**
        **Agente ideal:** Viper  
        **Estratégia:** Controle da área com Cortina Tóxica no meio e ultimate no Spike Site.  
        **Complementos:** Skye e Omen para apoio e controle.


        ---
        Aqui está a pergunta do usuário: ${question}
    
    `

    const agenteCounterStrike = `
        ## Especialidade
        Você é um assistente especialista em estratégias, economia, táticas e meta competitivo de **Counter-Strike** (CS:GO / CS2).

        ## Tarefa
        Responda às perguntas do usuário com base em informações atualizadas sobre o jogo.

        ## Regras
        - Se não souber, pesquise ou diga "Não sei".
        - Se a pergunta não for sobre CS, diga: **"Essa pergunta não é sobre o jogo."**
        - Use a data atual: **${new Date().toLocaleDateString('pt-BR')}**
        - Busque informações atualizadas da web (HLTV, updates, tier lists etc).
        - Não invente. Priorize precisão e confiabilidade.

        ## Resposta
        - Texto direto, claro e com **máximo de 500 caracteres**.
        - Use **Markdown**.
        - Destaque **armas, granadas, mapas, posições, economia**.
        - Sem introduções ou fechamentos.

        ## Exemplo
        **Pergunta do usuário:** Melhor tática para TR na Mirage?

        **Resposta:**
        **Tática:** Execução A padrão  
        **Passos:** Smokes CT, Jungle e Stair + Flash over Tetris + Molotov Shadow.  
        **Posicionamento:** 2 Rampas, 1 Palace, 2 Meio (lurk/conteúdo).


        ---
        Aqui está a pergunta do usuário: ${question}
    
    `

    const agenteLol = `
        ## Especialidade
        Você é um assistente especialista de meta do jogo ${game}.

        ## Tarefa
        Responda às perguntas do usuário com base em informações atualizadas e precisas sobre o jogo.

        ## Regras
        - Se não souber a resposta com certeza, diga "Não sei" ou pesquise antes de responder.
        - Se a pergunta não for sobre o jogo, responda: **"Essa pergunta não é sobre o jogo."**
        - Use a data atual: ${new Date().toLocaleDateString('pt-BR')}.
        - Faça pesquisas atualizadas na web sempre que necessário.
        - Nunca invente respostas. Priorize fontes confiáveis.

        ## Resposta
        - Seja direto, preciso e organizado.
        - Responda com no máximo **500 caracteres**.
        - Use **Markdown** para destacar itens, runas, agentes, armas etc.
        - **Não inclua introduções ou conclusões**, apenas a resposta.

        ## Exemplo
        **Pergunta do usuário:** Melhor build Rengar top?

        **Resposta:**
        **Itens:** Hemodrenário, Hidra Raivosa, Cutelo Negro.  
        **Runas:** Ritmo Fatal, Presença de Espírito, Lenda: Espontaneidade, Golpe de Misericórdia.


        ---
        Aqui está a pergunta do usuário: ${question}

    `

    let agente = ''

    if (game == 'valorant') {
        agente = agenteValorant
    } else if (game == 'csgo') {
        agente = agenteCounterStrike
    } else if (game == 'lol') {
        agente = agenteLol
    } else {
        console.warn(`Jogo não reconhecido: ${game}`);
    }

    // "arquivo" com as instruções para a AI
    const contents = [{
        role: 'user',
        parts :[{
            text: agente
        }]
    }]

    // ferramentas que a AI pode usar
    const tools = [{
        google_search: {}
    }]

    // chamada API, envia a pergunta para a AI
    const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },

        // converte o conteudo para JSON
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const  data = await response.json(); // converte a resposta da API para um objeto JS
    return data.candidates[0].content.parts[0].text;

}


const enviarFormulario =  async (event) => {

    event.preventDefault();

    const apiKey = apiKeyInput.value;
    const game = gameSelected.value;
    const question = questionInput.value;

    if(apiKey == '' || game == '' || question == '') {
        alert('Por favor preencha todos os campos.');
        return;
    }

   askButton.disabled = true;
   askButton.textContent = 'Enviando...';
   askButton.classList.add('loading');

    try {
        const text = await perguntarAI(question, game, apiKey);
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
        aiResponse.classList.remove('hiden');
    } catch (error) {
        console.log('Erro: ', error);
    } finally {
        askButton.disabled = false;
        askButton.textContent = 'Perguntar';
        askButton.classList.remove('loading');
    }


}   

form.addEventListener('submit', enviarFormulario);