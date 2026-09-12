# Resumo

MCP Servers para a API v2 da Kobana

## Contexto

A Kobana é uma plataforma de automação financeira.

Mais sobre a Kobana aqui: https://ai.kobana.com.br

A referência da API em swagger está aqui: https://raw.githubusercontent.com/universokobana/kobana-api-specs/refs/heads/main/swagger/all-versions/kobana-api-all-versions-openapi-3_1.json

# Instruções

Baseado na documentação da API desenvolva o código dos servidore MCP que implementam os endpoints da API.

Primeiramente faça um plano de implementação de acordo com essas instruções e documente em docs/ no formato markdown (.md)

Depois faça a implementação.

Cada servidor MCP implementará um namespace.
O namespace é o slug do path logo após a versão da API.
Os paths da API v2 seguem o seguinte formato: `[version]/[namespace]/[resource]`
Por exemplo, os endpoints de Recebimento Pix ficam em /v2/charge/pix
version: `v2`
namespace: `charge`
resource: `pix`

Então haverá um servidor de MCP somente para os recursos dentro de charge.
Coloque todo o código dentro da pasta `mcp-[namespace]`.
Neste exemplo pasta `mcp-charge`.

Implemente todos os endpoints da v2 apenas.
Não implemente nenhum endpoint da v1.

O código deve ser implementado para uso local e também para ser hospedado com as conexões Streamable HTTP e Legacy SSE.

A autenticação deve ser por Bearer acces token.

O nome dos resources deve seguir a convenção `[namespace]_[resource]`.
No exemplo seria `charge_pix`.

O nome das tools deve seguir a conversão `[action]_[namespace]_[resource]` e respeitando plural e singular.

Exemplos:
`get_chage_pix`
`get_payment_bank_billets`
`create_payment_bank_billet`
`delete_charge_pix`

Crie um README sobre como usar os servidores MCP locais e hospedados.

Crie um JSON com a estrutura de todos os servidores, tools, e resources disponiveis.

# Git flow

Não crie branches, trabalhe na main.

Pode ir fazendo commits conforme for realizando o trabalho.

Todo o código fonte deve ser escrito em inglês.