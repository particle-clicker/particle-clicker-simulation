/*jslint browser: true*/
/*global Game*/
(function () {
  'use strict';
  var game = new Game.Game();
  game.load();

  var DEBUG = true;
  var cps = 10;  // 10 clicks per second

  var log = function (message, color) {
    if (DEBUG) {
      var block = document.body.appendChild(document.createElement('pre'));
      block.innerText = message;
      if (color !== undefined) {
        block.setAttribute('style', 'color: ' + color + ';');
      }
    }
  };

  var formatTime = function(time) {
    var h = Math.floor(time / 3600),
        m = Math.floor((time - h * 3600) / 60),
        s = time - h * 3600 - m * 60;
    return h + 'h ' + m + 'm ' + s + 's';
  };

  var summary = function(game, time) {
    var hl = document.body.appendChild(document.createElement('h1'));
    hl.innerText = 'Summary after ' + formatTime(time);
    var block = document.body.appendChild(document.createElement('ul'));
    game.research.forEach(function (r) {
      var elem = block.appendChild(document.createElement('li'));
      elem.innerText = r.name + ' - Level: ' + r.state.level;
      elem.setAttribute('style', 'color: red;');
    });
    game.workers.forEach(function (w) {
      var elem = block.appendChild(document.createElement('li'));
      elem.innerText = w.name + ' - Hired: ' + w.state.hired;
      elem.setAttribute('style', 'color: blue;');
    });
  };

  var findBestDeal = function (arr, propCost, propValue) {
    var bestDeal = null,
        bestDealValuePerCost = 0;
    arr.forEach(function(a) {
      if (a.isAvailable(game.lab)) {  // don't wait
        var valuePerCost = a.state[propValue] / a.state[propCost];
        if (valuePerCost > bestDealValuePerCost) {
          bestDeal = a;
        }
      }
    });
    return bestDeal;
  };

  var findBestDealResearch = function () {
    return findBestDeal(game.research, 'reputation', 'cost');
  };

  var findBestDealWorkers = function () {
    return findBestDeal(game.workers, 'rate', 'cost');
  };
  
  var findBestDealUpgrades = function () {
    var i, u;
    for (i = 0; i < game.upgrades.length; i++) {
      u = game.upgrades[i];
      if (u.isAvailable(game.lab, game.allObjects)) {
        return u;
      }
    }
    return null;
  };

  var time = 0;
  var step = function () {
    time++;
    var i;
    for (i = 0; i < cps; i++) {
      game.lab.clickDetector();
    }

    game.lab.getGrant();
    var sum = 0;
    for (i = 0; i < game.workers.length; i++) {
      sum += game.workers[i].state.hired * game.workers[i].state.rate;
    }
    game.lab.acquireData(sum);

    var bestDealResearch = findBestDealResearch(),
        bestDealWorkers = findBestDealWorkers(),
        bestDealUpgrades = findBestDealUpgrades();
    if (bestDealResearch !== null) {
      if (bestDealResearch.research(game.lab) > 0) {
        log('[' + formatTime(time) + '] ' + bestDealResearch.key,
            'red');
      }
    }
    if (bestDealUpgrades !== null) {
      if (bestDealUpgrades.buy(game.lab, game.allObjects) > 0) {
        log('[' + formatTime(time) + '] ' + bestDealUpgrades.key,
            'green');
      }
    }
    if (bestDealWorkers !== null) {
      if (bestDealWorkers.hire(game.lab) > 0) {
        log('[' + formatTime(time) + '] ' + bestDealWorkers.key,
            'blue');
      }
    }
  };
  
  var i;
  for (i = 0; i < 100000; i++) {
    step();
  }
  //while (game.research[8].state.level < 20) {
  //  step();
  //}
  summary(game, time);
}()); 
