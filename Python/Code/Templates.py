horizontalHTMLTemplate = '''
<html>
    <head>
        <script src="Team.js"></script>
        <script>
            (function() {
                var _v = null;
                fetch('version.txt').then(function(r){return r.text();}).then(function(t){_v=t.trim();}).catch(function(){});
                setInterval(function() {
                    fetch('version.txt?_='+Date.now()).then(function(r){return r.text();}).then(function(t){
                        if (_v !== null && t.trim() !== _v) {
                            try { localStorage.removeItem('pkOrder'); } catch(e) {}
                            location.reload();
                        }
                    }).catch(function(){});
                }, 2000);
            })();
        </script>
        <script>
            var SHADOW_SRC = "https://i.postimg.cc/xdmpF4Tm/Shadow.png";
            var BG_SRC     = "https://i.postimg.cc/0QdW9KS2/Pokeball-Background.png";
            var TEAM_PATH  = "../OBS/CurrentTeam/";
            var _order     = [0,1,2,3,4,5];
            var _dragSrc   = null;

            function renderTeam(order) {
                _order = order.slice();
                for (var i = 0; i < 6; i++) {
                    var slot = i + 1;
                    var d = (window.teamData && window.teamData[order[i]]) || {name:"",alias:"",shadow:false,bg:false};
                    document.getElementById("p"    + slot).textContent = d.alias;
                    document.getElementById("img"  + slot).src = d.name ? TEAM_PATH + d.name + ".gif" : "";
                    var sh = document.getElementById("shadow" + slot);
                    if (sh) sh.src = (d.shadow && d.name) ? SHADOW_SRC : "";
                    var bg = document.getElementById("pokeballBackground" + slot);
                    if (bg) bg.src = (d.bg && d.name) ? BG_SRC : "";
                }
            }

            function initDrag() {
                document.querySelectorAll(".pkDiv").forEach(function(el) {
                    el.addEventListener("dragstart", function(e) {
                        _dragSrc = parseInt(el.dataset.slot) - 1;
                        el.classList.add("dragging");
                        e.dataTransfer.effectAllowed = "move";
                    });
                    el.addEventListener("dragend", function() {
                        el.classList.remove("dragging");
                        document.querySelectorAll(".pkDiv").forEach(function(x) { x.classList.remove("drag-over"); });
                        _dragSrc = null;
                    });
                    el.addEventListener("dragover", function(e) {
                        e.preventDefault();
                        el.classList.add("drag-over");
                    });
                    el.addEventListener("dragleave", function() {
                        el.classList.remove("drag-over");
                    });
                    el.addEventListener("drop", function(e) {
                        e.preventDefault();
                        el.classList.remove("drag-over");
                        var tgt = parseInt(el.dataset.slot) - 1;
                        if (_dragSrc !== null && _dragSrc !== tgt) {
                            var newOrder = _order.slice();
                            var tmp = newOrder[_dragSrc];
                            newOrder[_dragSrc] = newOrder[tgt];
                            newOrder[tgt] = tmp;
                            try { localStorage.setItem("pkOrder", JSON.stringify(newOrder)); } catch(e) {}
                            renderTeam(newOrder);
                        }
                        _dragSrc = null;
                    });
                });
            }
        </script>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
        <style>
            .pkDiv {
                width: 225px;
                height: 150px;
                float: left;
                cursor: grab;
            }
            .pkDiv.dragging  { opacity: 0.35; }
            .pkDiv.drag-over { outline: 2px solid rgba(255,255,255,0.7); border-radius: 4px; }
            [id^="pokeballBackground"] {
                position: absolute;
                width: 225px;
                height: 150px;
                z-index: -1;
            }
            .shadowDiv {
                width: 225px;
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
                font-family: Anton, \'Arial Narrow Bold\', sans-serif;
                font-size: 35px;
                text-shadow:
                    3px 3px 0 #000,
                    -3px 3px 0 #000,
                    -3px -3px 0 #000,
                    3px -3px 0 #000;
            }
            .container { clear: both; }
            @keyframes fadeSlideUp {
                from { opacity: 0; transform: translateY(12px); }
                to   { opacity: 1; transform: translateY(0);    }
            }
            .pkDiv, .shadowDiv {
                animation: fadeSlideUp 0.45s ease forwards;
                opacity: 0;
            }
            .pkDiv:nth-child(1), .shadowDiv:nth-child(1) { animation-delay: 0.00s; }
            .pkDiv:nth-child(2), .shadowDiv:nth-child(2) { animation-delay: 0.12s; }
            .pkDiv:nth-child(3), .shadowDiv:nth-child(3) { animation-delay: 0.24s; }
            .pkDiv:nth-child(4), .shadowDiv:nth-child(4) { animation-delay: 0.36s; }
            .pkDiv:nth-child(5), .shadowDiv:nth-child(5) { animation-delay: 0.48s; }
            .pkDiv:nth-child(6), .shadowDiv:nth-child(6) { animation-delay: 0.60s; }
        </style>
    </head>

    <body onload="changeP(); initDrag();">
        <div class="container">
            <div class="pkDiv" draggable="true" data-slot="1"><p id="p1"></p><img id="pokeballBackground1"><img id="img1"></div>
            <div class="pkDiv" draggable="true" data-slot="2"><p id="p2"></p><img id="pokeballBackground2"><img id="img2"></div>
            <div class="pkDiv" draggable="true" data-slot="3"><p id="p3"></p><img id="pokeballBackground3"><img id="img3"></div>
            <div class="pkDiv" draggable="true" data-slot="4"><p id="p4"></p><img id="pokeballBackground4"><img id="img4"></div>
            <div class="pkDiv" draggable="true" data-slot="5"><p id="p5"></p><img id="pokeballBackground5"><img id="img5"></div>
            <div class="pkDiv" draggable="true" data-slot="6"><p id="p6"></p><img id="pokeballBackground6"><img id="img6"></div>
        </div>
        <div class="container">
            <div class="shadowDiv"><img id="shadow1"></div>
            <div class="shadowDiv"><img id="shadow2"></div>
            <div class="shadowDiv"><img id="shadow3"></div>
            <div class="shadowDiv"><img id="shadow4"></div>
            <div class="shadowDiv"><img id="shadow5"></div>
            <div class="shadowDiv"><img id="shadow6"></div>
        </div>
    </body>
</html>
    '''

verticalHtmlTemplate = '''
<html>
    <head>
        <script src="Team.js"></script>
        <script>
            (function() {
                var _v = null;
                fetch('version.txt').then(function(r){return r.text();}).then(function(t){_v=t.trim();}).catch(function(){});
                setInterval(function() {
                    fetch('version.txt?_='+Date.now()).then(function(r){return r.text();}).then(function(t){
                        if (_v !== null && t.trim() !== _v) {
                            try { localStorage.removeItem('pkOrder'); } catch(e) {}
                            location.reload();
                        }
                    }).catch(function(){});
                }, 2000);
            })();
        </script>
        <script>
            var SHADOW_SRC = "https://i.postimg.cc/xdmpF4Tm/Shadow.png";
            var BG_SRC     = "https://i.postimg.cc/0QdW9KS2/Pokeball-Background.png";
            var TEAM_PATH  = "../OBS/CurrentTeam/";
            var _order     = [0,1,2,3,4,5];
            var _dragSrc   = null;

            function renderTeam(order) {
                _order = order.slice();
                for (var i = 0; i < 6; i++) {
                    var slot = i + 1;
                    var d = (window.teamData && window.teamData[order[i]]) || {name:"",alias:"",shadow:false,bg:false};
                    document.getElementById("p"    + slot).textContent = d.alias;
                    document.getElementById("img"  + slot).src = d.name ? TEAM_PATH + d.name + ".gif" : "";
                    var sh = document.getElementById("shadow" + slot);
                    if (sh) sh.src = (d.shadow && d.name) ? SHADOW_SRC : "";
                    var bg = document.getElementById("pokeballBackground" + slot);
                    if (bg) bg.src = (d.bg && d.name) ? BG_SRC : "";
                }
            }

            function initDrag() {
                document.querySelectorAll(".pair").forEach(function(el) {
                    el.setAttribute("draggable", "true");
                    el.addEventListener("dragstart", function(e) {
                        _dragSrc = parseInt(el.dataset.slot) - 1;
                        el.classList.add("dragging");
                        e.dataTransfer.effectAllowed = "move";
                    });
                    el.addEventListener("dragend", function() {
                        el.classList.remove("dragging");
                        document.querySelectorAll(".pair").forEach(function(x) { x.classList.remove("drag-over"); });
                        _dragSrc = null;
                    });
                    el.addEventListener("dragover", function(e) {
                        e.preventDefault();
                        el.classList.add("drag-over");
                    });
                    el.addEventListener("dragleave", function() {
                        el.classList.remove("drag-over");
                    });
                    el.addEventListener("drop", function(e) {
                        e.preventDefault();
                        el.classList.remove("drag-over");
                        var tgt = parseInt(el.dataset.slot) - 1;
                        if (_dragSrc !== null && _dragSrc !== tgt) {
                            var newOrder = _order.slice();
                            var tmp = newOrder[_dragSrc];
                            newOrder[_dragSrc] = newOrder[tgt];
                            newOrder[tgt] = tmp;
                            try { localStorage.setItem("pkOrder", JSON.stringify(newOrder)); } catch(e) {}
                            renderTeam(newOrder);
                        }
                        _dragSrc = null;
                    });
                });
            }
        </script>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
        <style>
            .wrapper {
                display: flex;
                flex-direction: column;
            }
            .pair {
                display: flex;
                flex-direction: column;
                margin: 0 0 20px 0;
                padding: 0;
                width: 225px;
                align-items: center;
                cursor: grab;
            }
            .pair.dragging  { opacity: 0.35; }
            .pair.drag-over { outline: 2px solid rgba(255,255,255,0.7); border-radius: 4px; }
            .pkDiv, .shadowDiv { margin: 0; padding: 0; }
            .pkDiv     { width: 225px; }
            .shadowDiv { width: 150px; margin-top: -15px; }
            [id^="pokeballBackground"] {
                position: absolute;
                width: 225px;
                height: 150px;
                z-index: -1;
            }
            img {
                display: block;
                width: 100%;
                height: auto;
                max-height: 100px;
                object-fit: contain;
            }
            p {
                margin: 0;
                padding: 0;
                height: 25px;
                color: white;
                font-family: Anton, \'Arial Narrow Bold\', sans-serif;
                font-size: 25px;
                text-align: center;
                text-shadow:
                    3px 3px 0 #000,
                    -3px 3px 0 #000,
                    -3px -3px 0 #000,
                    3px -3px 0 #000;
            }
            @keyframes fadeSlideUp {
                from { opacity: 0; transform: translateY(12px); }
                to   { opacity: 1; transform: translateY(0);    }
            }
            .pair {
                animation: fadeSlideUp 0.45s ease forwards;
                opacity: 0;
            }
            .pair:nth-child(1) { animation-delay: 0.00s; }
            .pair:nth-child(2) { animation-delay: 0.12s; }
            .pair:nth-child(3) { animation-delay: 0.24s; }
            .pair:nth-child(4) { animation-delay: 0.36s; }
            .pair:nth-child(5) { animation-delay: 0.48s; }
            .pair:nth-child(6) { animation-delay: 0.60s; }
        </style>
    </head>

    <body onload="changeP(); initDrag();">
        <div class="wrapper">
            <div class="pair" data-slot="1">
                <div class="pkDiv"><p id="p1"></p><img id="pokeballBackground1"><img id="img1"></div>
                <div class="shadowDiv"><img id="shadow1"></div>
            </div>
            <div class="pair" data-slot="2">
                <div class="pkDiv"><p id="p2"></p><img id="pokeballBackground2"><img id="img2"></div>
                <div class="shadowDiv"><img id="shadow2"></div>
            </div>
            <div class="pair" data-slot="3">
                <div class="pkDiv"><p id="p3"></p><img id="pokeballBackground3"><img id="img3"></div>
                <div class="shadowDiv"><img id="shadow3"></div>
            </div>
            <div class="pair" data-slot="4">
                <div class="pkDiv"><p id="p4"></p><img id="pokeballBackground4"><img id="img4"></div>
                <div class="shadowDiv"><img id="shadow4"></div>
            </div>
            <div class="pair" data-slot="5">
                <div class="pkDiv"><p id="p5"></p><img id="pokeballBackground5"><img id="img5"></div>
                <div class="shadowDiv"><img id="shadow5"></div>
            </div>
            <div class="pair" data-slot="6">
                <div class="pkDiv"><p id="p6"></p><img id="pokeballBackground6"><img id="img6"></div>
                <div class="shadowDiv"><img id="shadow6"></div>
            </div>
        </div>
    </body>
</html>
'''