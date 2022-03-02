import { Text, View, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "../styles/style";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

let board = [];
const NBR_OF_DICES = 5;
const NBR_OF_THROWS = 3;
const POINTS_TO_BONUS = 63;

export default function Gameboard() {
  const [status, setStatus] = useState("Throw dices.");
  const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
  const [bonusStatus, setBonusStatus] = useState(
    "You are " + POINTS_TO_BONUS + " points away from bonus"
  );
  const [roundEnded, setRoundEnded] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  //Fill selected dices and selected points array with false. Die and point color is determined by the boolean value in this array
  const [selectedDices, setSelectedDices] = useState(
    new Array(NBR_OF_DICES).fill(false)
  );
  const [selectedPoints, setSelectedPoints] = useState(
    new Array(6).fill(false)
  );

  //Locked points is used for locking selected points when a round is finished, so the user can't deselect points after moving on to the next round.
  const [lockedPoints, setLockedPoints] = useState(new Array(6).fill(false));

  //Points array is for displaying and using the points the user selects to put in after throwing the game.
  const [points, setPoints] = useState(new Array(6).fill(0));

  const row = []; //Make an empty row and fill it with the dice icons
  for (let i = 0; i < NBR_OF_DICES; i++) {
    row.push(
      <Pressable key={"row" + i} onPress={() => selectDice(i)}>
        <MaterialCommunityIcons
          name={board[i]}
          key={"die" + i}
          size={50}
          color={getDiceColor(i)}
        ></MaterialCommunityIcons>
      </Pressable>
    );
  }

  const pointRow = [];
  for (let i = 0; i < 6; i++) {
    pointRow.push(
      //Add one to i because of point and dice value one having the value of 0 on i
      <Pressable key={"pointRow" + (i + 1)} onPress={() => selectPoints(i)}>
        <MaterialCommunityIcons
          name={"numeric-" + (i + 1) + "-circle"}
          key={"pointIcon" + (i + 1)}
          size={50}
          color={getPointsColor(i)}
        ></MaterialCommunityIcons>
      </Pressable>
    );
  }

  useEffect(() => {
    //Set round ended to false on dice throw so the button text will change back to "Throw dice" from "Next round"
    setRoundEnded(false);

    //Lock points when the user uses another dice roll.
    //Assign lockedPoints as the same array as selectedPoints. This lets the user go back on their point choice
    //before rolling the dice again. A dice roll locks the point selection
    setLockedPoints([...selectedPoints]);

    if (nbrOfThrowsLeft < 0) {
      setNbrOfThrowsLeft(NBR_OF_THROWS);
      //Roll the dice when starting a new turn
      setSelectedDices(new Array(NBR_OF_DICES).fill(false));
    }

    if (nbrOfThrowsLeft == 0) {
      setStatus("Select your points");
      //On the last throw, set Round ended to false to make sure the player doesn't throw dices before selecting points
      setRoundEnded(false);
    } else if (nbrOfThrowsLeft == NBR_OF_THROWS) {
      setStatus("Throw dices.");
    } else {
      setStatus("Select and throw dices again");
    }
  }, [nbrOfThrowsLeft]);

  useEffect(() => {
    if (selectedPoints.every((val, i, arr) => val == true)) {
      //Game ends when all points have a value in them
      setStatus("Game over, all points selected");
      setGameOver(true);
    }
  }, [selectedPoints]);

  function getDiceColor(i) {
    //Black is a selected one, steelblue is default color. selectedDices is a boolean value.
    return selectedDices[i] ? "black" : "steelblue";
  }

  function selectDice(i) {
    if (nbrOfThrowsLeft != NBR_OF_THROWS) {
      let dices = [...selectedDices];
      dices[i] = selectedDices[i] ? false : true;
      setSelectedDices(dices);
    } else {
      setStatus("You have to throw dices first");
    }
  }

  function checkRoundEnd() {
    //Check that the user has selected points and the current round is over before throwing
    //This also fixes the bug where if user selects 2 points and removes the other, the game won't let you continue
    let isRoundPlayed = roundEnded;
    //If the selected points(current ones) and locked points (from previous round) are the same, then the user has not selected new points
    if (JSON.stringify(selectedPoints) == JSON.stringify(lockedPoints)) {
      isRoundPlayed = false;
    }
    return isRoundPlayed;
  }

  function throwDices() {
    if (checkRoundEnd() || nbrOfThrowsLeft > 0) {
      //This is to keep the dices stay the same when moving to the next round
      if (nbrOfThrowsLeft != 0) {
        for (let i = 0; i < NBR_OF_DICES; i++) {
          if (!selectedDices[i]) {
            let randomNumber = Math.floor(Math.random() * 6 + 1);
            board[i] = "dice-" + randomNumber;
          }
        }
      }
      setNbrOfThrowsLeft(nbrOfThrowsLeft - 1);
    } else {
      setStatus("Select your points before next throw");
    }
  }

  function getPointsColor(i) {
    //Black is a selected one, steelblue is default color. selectedDices is a boolean value.
    return selectedPoints[i] ? "black" : "steelblue";
  }

  function selectPoints(i) {
    //If the user has thrown all of their throws, they can set their points. If not, an instruction message is shown
    if (nbrOfThrowsLeft == 0) {
      //Use lockedPoints array instead of selectedPoints to get rid of the one step behind -problem
      if (lockedPoints[i] == false) {
        let point = [...selectedPoints];
        point[i] = selectedPoints[i] ? false : true;
        setSelectedPoints(point);
        let pointsFromDice = 0;

        for (let j = 0; j < board.length; j++) {
          if (board[j] == "dice-" + (i + 1)) {
            pointsFromDice += i + 1;
          }
        }

        if (point[i] == true) {
          points[i] += pointsFromDice;
          addPointsToBonus();
          //Set roundEnded to true so that the user can move on to the next round after selecting just one point
          setRoundEnded(true);
          setStatus("Points selected, click on Next Round");
        } else {
          points[i] -= pointsFromDice;
          addPointsToBonus();
          //Setting game over to false when deselecting point makes the user able to continue if they for example accidentally chose all the points
          //When they still had turns left
          setGameOver(false);
        }
      } else {
        setStatus("You already selected points for " + (i + 1));
      }
    } else {
      setStatus("Throw 3 times before setting points");
    }
  }

  function addPointsToBonus() {
    //Sum all of the points from the array
    let sumOfPoints = points.reduce((partialSum, a) => partialSum + a, 0);
    let pointsToBonus = 63 - sumOfPoints;
    setTotalPoints(sumOfPoints);

    //Display status of the bonus depending if the user has over 63 points or not
    if (pointsToBonus < 0) {
      setBonusStatus("You got the bonus!");
    } else {
      setBonusStatus("You are " + pointsToBonus + " points away from bonus");
    }
  }

  function resetGame() {
    setNbrOfThrowsLeft(NBR_OF_THROWS);
    board = [];
    setSelectedPoints(new Array(6).fill(false));
    setLockedPoints(new Array(6).fill(false));
    setSelectedDices(new Array(6).fill(false));
    setPoints(new Array(6).fill(0));
    setStatus("Throw dices.");
    setBonusStatus("You are " + POINTS_TO_BONUS + " points away from bonus");
    setTotalPoints(0);
    setGameOver(false);
  }

  return (
    <View style={styles.gameboard}>
      {/* row includes all of the dice icons */}
      <View style={styles.flex}>{row}</View>
      {/* The ternary operator is here just to get rid of the problem of Thows left showing as -1 for a split second.
      It's a bit stupid, but it works and doesn't cause any problems */}
      <Text style={styles.gameinfo}>Throws left: {nbrOfThrowsLeft == -1 ? 0 : nbrOfThrowsLeft}</Text>
      <Text style={styles.gameinfo}>{status}</Text>

      {/* Big button for moving on with the rounds, throwing dice or restarting the game */}
      {gameOver ? (
        <Pressable style={styles.button} onPress={() => resetGame()}>
          <Text style={styles.buttonText}>Restart game</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.button} onPress={() => throwDices()}>
          <Text style={styles.buttonText}>
            {roundEnded ? "Next round" : "Throw dice"}
          </Text>
        </Pressable>
      )}

      <Text style={styles.totalPoints}>Total: {totalPoints}</Text>
      <Text>{bonusStatus}</Text>
      <View style={styles.flex}>
        {/* Map all of the points from the points array to show the player */}
        {points.map((point, index) => (
          <Text key={index} style={styles.pointCount}>
            {point}
          </Text>
        ))}
      </View>
      {/* PointRow includes all of the point icons */}
      <View style={styles.flex}>{pointRow}</View>
    </View>
  );
}
