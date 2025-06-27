horizontalHTMLTemplate = '''
<html>
    <head>
        <script src="Team.js"></script>
        <meta charset="UTF-8">
        <style>
            .pkDiv{
                width:225px;
                height: 150px;
                float: left;
            }
            #pokeballBackground1, #pokeballBackground2, #pokeballBackground3, #pokeballBackground4, #pokeballBackground5, #pokeballBackground6 {
                position: absolute;
                width: 225px;
                height: 150px;
                z-index: -1;
            }
            .shadowDiv{
                width:225px;
                height: 150px;
                float: left;
                padding-top: 80px;
            }
            img {
                width: 100%;
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
            p {
                height: 25px;
                color: white;
                text-align: center;
                font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
                font-size: 35px;
                text-shadow:
                    3px 3px 0 #000,
                    -3px 3px 0 #000,
                    -3px -3px 0 #000,
                    3px -3px 0 #000;
            }
            .container{
                clear: both;
            }
        </style>
    </head>

    <body onload="changeP()">
        <div class="container">
            <div class="pkDiv"> %pkDivContent1 </div>
            <div class="pkDiv"> %pkDivContent2 </div>
            <div class="pkDiv"> %pkDivContent3 </div>
            <div class="pkDiv"> %pkDivContent4 </div>
            <div class="pkDiv"> %pkDivContent5 </div>
            <div class="pkDiv"> %pkDivContent6 </div>
        </div>
        <div class="container">
            <div class="shadowDiv">
                <img id="shadow1">
            </div>       
            <div class="shadowDiv">
                <img id="shadow2">
            </div>       
            <div class="shadowDiv">
                <img id="shadow3">
            </div>        
            <div class="shadowDiv">
                <img id="shadow4">
            </div>        
            <div class="shadowDiv">
                <img id="shadow5">
            </div>        
            <div class="shadowDiv">
                <img id="shadow6">
            </div>
        </div>
    </body>
</html>
    '''

verticalHtmlTemplate = '''
 <html>
    <head>
        <script src="Team.js"></script>
        <meta charset="UTF-8">
        <style>
            .wrapper {
                display: flex;
                flex-direction: column;
            }

            .pair {
                display: flex;
                flex-direction: column;
                margin: 0;
                padding: 0;
                margin-bottom: 20px;
                width: 225px;
                align-items: center;
            }

            .pkDiv, .shadowDiv {
                margin: 0;
                padding: 0;
            }

            .pkDiv {
                width: 225px;
            }

            .shadowDiv {
                width: 150px;
            }

            #pokeballBackground1, #pokeballBackground2, #pokeballBackground3, #pokeballBackground4, #pokeballBackground5, #pokeballBackground6 {
                position: absolute;
                width: 225px;
                height: 150px;
                z-index: -1;
            }

            .shadowDiv {
            margin-top: -15px;
            }

            img {
                display: block; /* elimina espacios fantasmas debajo de imágenes */
                width: 100%;
                height: auto;
                max-height: 100px; /* ajusta si quieres */
                object-fit: contain;
            }

            p {
                margin: 0;
                padding: 0;
                height: 25px;
                color: white;
                font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
                font-size: 25px;
                text-align: center;
                text-shadow:
                    3px 3px 0 #000,
                    -3px 3px 0 #000,
                    -3px -3px 0 #000,
                    3px -3px 0 #000;
            }
        </style>
    </head>

    <body onload="changeP()">
        <div class="wrapper">
            <div class="pair">
                <div class="pkDiv"> %pkDivContent1 </div>
                <div class="shadowDiv">
                <img id="shadow1"></img>
                </div>
            </div>
            <div class="pair">
                <div class="pkDiv"> %pkDivContent2 </div>
                <div class="shadowDiv">
                    <img id="shadow2"></img>
                </div>
            </div>
            <div class="pair">
                <div class="pkDiv"> %pkDivContent3 </div>
                <div class="shadowDiv">
                    <img id="shadow3"></img>
                </div>
            </div>
            <div class="pair">
                <div class="pkDiv"> %pkDivContent4 </div>
                <div class="shadowDiv">
                    <img id="shadow4"></img>
                </div>
            </div>
            <div class="pair">
                <div class="pkDiv"> %pkDivContent5 </div>
                <div class="shadowDiv">
                    <img id="shadow5"></img>
                </div>
            </div>
            <div class="pair">
                <div class="pkDiv"> %pkDivContent6 </div>
                <div class="shadowDiv">
                    <img id="shadow6"></img>
                </div>
            </div>
        </div>
    </body>
</html>
'''