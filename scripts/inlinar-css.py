# -*- coding: utf-8 -*-
"""
Copia o conteudo de css/styles.css pra dentro da tag <style> no
<head> do index.html, substituindo o bloco inline anterior.

Por que existe: o CSS foi colocado inline no HTML (em vez de um
<link rel="stylesheet"> externo) pra eliminar uma requisicao que
bloqueava a renderizacao inicial da pagina (apontado pelo PageSpeed
Insights). Isso significa que css/styles.css nao e mais lido pelo
navegador; ele continua existindo so como a fonte de verdade pra
editar o CSS.

Como usar: sempre que editar css/styles.css, rode
    python scripts/inlinar-css.py
a partir da raiz do projeto pra sincronizar o bloco <style> do
index.html com a edicao.
"""
import re
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
INDEX_HTML = RAIZ / "index.html"
CSS = RAIZ / "css" / "styles.css"

html = INDEX_HTML.read_text(encoding="utf-8")
css = CSS.read_text(encoding="utf-8")

bloco_novo = (
    "<style>\n"
    "/* CSS inline (copiado de css/styles.css) pra eliminar a requisicao\n"
    "   externa que bloqueia a renderizacao inicial da pagina. O arquivo\n"
    "   css/styles.css continua sendo a fonte pra editar; depois de\n"
    "   editar, rode scripts/inlinar-css.py novamente pra sincronizar. */\n"
    + css.strip() + "\n"
    "</style>"
)

padrao_link = r'<link rel="stylesheet" href="css/styles\.css">'
padrao_style_existente = r"<style>\n/\* CSS inline.*?</style>"

if re.search(padrao_style_existente, html, re.DOTALL):
    html_novo, n = re.subn(padrao_style_existente, bloco_novo, html, flags=re.DOTALL)
    print(f"Bloco <style> inline ja existia, foi ressincronizado ({n} substituicao).")
elif re.search(padrao_link, html):
    html_novo, n = re.subn(padrao_link, bloco_novo, html)
    print(f"Link externo substituido por <style> inline ({n} substituicao).")
else:
    raise SystemExit("Nao encontrei nem o <link> nem um bloco <style> inline existente. Abortando.")

INDEX_HTML.write_text(html_novo, encoding="utf-8")
print(f"CSS inline agora tem {len(css)} bytes (de css/styles.css).")
