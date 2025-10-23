set -x
set -e
(
    cd ace-editor/src/
    rm -rf ace-web-component.js
    rm -rf ace-web-component.d.ts
    ln -s ../../ace-web-component.js .
    ln -s ../../ace-web-component.d.ts .
    ls -la
)