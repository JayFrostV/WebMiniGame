Math.minmax = (value, limit) => {
  return Math.max(Math.min(value, limit), -limit);
};

// Khoảng cách 2D giữa hai điểm
const distance2D = (p1, p2) => {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
};

// Góc giữa hai điểm
const getAngle = (p1, p2) => {
  let angle = Math.atan((p2.y - p1.y) / (p2.x - p1.x));
  if (p2.x - p1.x < 0) angle += Math.PI;
  return angle;
};

// Khoảng cách gần nhất giữa một quả bóng và đầu tường có thể đạt được
const closestItCanBe = (cap, ball) => {
  let angle = getAngle(cap, ball);

  const deltaX = Math.cos(angle) * (wallW / 2 + ballSize / 2);
  const deltaY = Math.sin(angle) * (wallW / 2 + ballSize / 2);

  return { x: cap.x + deltaX, y: cap.y + deltaY };
};

// Lăn bóng quanh đầu tường
const rollAroundCap = (cap, ball) => {
  // Hướng mà bóng không thể di chuyển xa hơn vì bị tường chặn lại
  let impactAngle = getAngle(ball, cap);

  // Hướng bóng muốn di chuyển dựa trên vận tốc của nó
  let heading = getAngle(
      { x: 0, y: 0 },
      { x: ball.velocityX, y: ball.velocityY }
  );

  // Góc giữa hướng va chạm và hướng di chuyển mong muốn của bóng
  // Góc này càng nhỏ, va chạm càng lớn
  // Góc càng gần 90 độ, va chạm càng mượt (ở 90 độ sẽ không có va chạm nào)
  let impactHeadingAngle = impactAngle - heading;

  // Khoảng cách vận tốc nếu không có va chạm xảy ra
  const velocityMagnitude = distance2D(
      { x: 0, y: 0 },
      { x: ball.velocityX, y: ball.velocityY }
  );
  // Thành phần vận tốc chéo với hướng va chạm
  const velocityMagnitudeDiagonalToTheImpact =
      Math.sin(impactHeadingAngle) * velocityMagnitude;

  // Bóng phải cách đầu tường bao xa
  const closestDistance = wallW / 2 + ballSize / 2;

  const rotationAngle = Math.atan(
      velocityMagnitudeDiagonalToTheImpact / closestDistance
  );

  const deltaFromCap = {
      x: Math.cos(impactAngle + Math.PI - rotationAngle) * closestDistance,
      y: Math.sin(impactAngle + Math.PI - rotationAngle) * closestDistance
  };

  const x = ball.x;
  const y = ball.y;
  const velocityX = ball.x - (cap.x + deltaFromCap.x);
  const velocityY = ball.y - (cap.y + deltaFromCap.y);
  const nextX = x + velocityX;
  const nextY = y + velocityY;

  return { x, y, velocityX, velocityY, nextX, nextY };
};

// Giảm giá trị tuyệt đối của một số nhưng vẫn giữ dấu của nó, không giảm xuống dưới giá trị tuyệt đối 0
const slow = (number, difference) => {
  if (Math.abs(number) <= difference) return 0;
  if (number > difference) return number - difference;
  return number + difference;
};

const mazeElement = document.getElementById("maze");
const joystickHeadElement = document.getElementById("joystick-head");
const noteElement = document.getElementById("note"); // Yếu tố ghi chú để hiện hướng dẫn và các văn bản trò chơi thắng, trò chơi thất bại

let hardMode = false;
let previousTimestamp;
let gameInProgress;
let mouseStartX;
let mouseStartY;
let accelerationX;
let accelerationY;
let frictionX;
let frictionY;

const pathW = 25; // Kích thước của đường đi
const wallW = 10; // Kích thước của tường
const ballSize = 10; // Kích thước của quả bóng
const holeSize = 18;

const debugMode = false;

let balls = [];
let ballElements = [];
let holeElements = [];

resetGame();

// Vẽ bóng lần đầu tiên
balls.forEach(({ x, y }) => {
  const ball = document.createElement("div");
  ball.setAttribute("class", "ball");
  ball.style.cssText = `left: ${x}px; top: ${y}px; `;

  mazeElement.appendChild(ball);
  ballElements.push(ball);
});

// Dữ liệu tường
const walls = [
  // Đường viền
  { column: 0, row: 0, horizontal: true, length: 10 },
  { column: 0, row: 0, horizontal: false, length: 9 },
  { column: 0, row: 9, horizontal: true, length: 10 },
  { column: 10, row: 0, horizontal: false, length: 9 },

  // Các dòng ngang bắt đầu từ cột thứ nhất
  { column: 0, row: 6, horizontal: true, length: 1 },
  { column: 0, row: 8, horizontal: true, length: 1 },

  // Các dòng ngang bắt đầu từ cột thứ hai
  { column: 1, row: 1, horizontal: true, length: 2 },
  { column: 1, row: 7, horizontal: true, length: 1 },

  // Các dòng ngang bắt đầu từ cột thứ ba
  { column: 2, row: 2, horizontal: true, length: 2 },
  { column: 2, row: 4, horizontal: true, length: 1 },
  { column: 2, row: 5, horizontal: true, length: 1 },
  { column: 2, row: 6, horizontal: true, length: 1 },

  // Các dòng ngang bắt đầu từ cột thứ tư
  { column: 3, row: 3, horizontal: true, length: 1 },
  { column: 3, row: 8, horizontal: true, length: 3 },

  // Các dòng ngang bắt đầu từ cột thứ năm
  { column: 4, row: 6, horizontal: true, length: 1 },

  // Các dòng ngang bắt đầu từ cột thứ sáu
  { column: 5, row: 2, horizontal: true, length: 2 },
  { column: 5, row: 7, horizontal: true, length: 1 },

  // Các dòng ngang bắt đầu từ cột thứ bảy
  { column: 6, row: 1, horizontal: true, length: 1 },
  { column: 6, row: 6, horizontal: true, length: 2 },

  // Các dòng ngang bắt đầu từ cột thứ tám
  { column: 7, row: 3, horizontal: true, length: 2 },
  { column: 7, row: 7, horizontal: true, length: 2 },

  // Các dòng ngang bắt đầu từ cột thứ chín
  { column: 8, row: 1, horizontal: true, length: 1 },
  { column: 8, row: 2, horizontal: true, length: 1 },
  { column: 8, row: 3, horizontal: true, length: 1 },
  { column: 8, row: 4, horizontal: true, length: 2 },
  { column: 8, row: 8, horizontal: true, length: 2 },

  // Các dòng dọc sau cột thứ nhất
  { column: 1, row: 1, horizontal: false, length: 2 },
  { column: 1, row: 4, horizontal: false, length: 2 },

  // Các dòng dọc sau cột thứ hai
  { column: 2, row: 2, horizontal: false, length: 2 },
  { column: 2, row: 5, horizontal: false, length: 1 },
  { column: 2, row: 7, horizontal: false, length: 2 },

  // Các dòng dọc sau cột thứ ba
  { column: 3, row: 0, horizontal: false, length: 1 },
  { column: 3, row: 4, horizontal: false, length: 1 },
  { column: 3, row: 6, horizontal: false, length: 2 },

  // Các dòng dọc sau cột thứ tư
  { column: 4, row: 1, horizontal: false, length: 2 },
  { column: 4, row: 6, horizontal: false, length: 1 },

  // Các dòng dọc sau cột thứ năm
  { column: 5, row: 0, horizontal: false, length: 2 },
  { column: 5, row: 6, horizontal: false, length: 1 },
  { column: 5, row: 8, horizontal: false, length: 1 },

  // Các dòng dọc sau cột thứ sáu
  { column: 6, row: 1, horizontal: false, length: 2 },

  // Các dòng dọc sau cột thứ bảy
  { column: 7, row: 0, horizontal: false, length: 2 },
  { column: 7, row: 4, horizontal: false, length: 3 },

  // Các dòng dọc sau cột thứ tám
  { column: 8, row: 2, horizontal: false, length: 1 },
  { column: 8, row: 5, horizontal: false, length: 1 },
  
    // Các đường dọc sau cột thứ 9
    { column: 9, row: 1, horizontal: false, length: 1 },
    { column: 9, row: 5, horizontal: false, length: 2 }
  ].map((wall) => ({
    x: wall.column * (pathW + wallW),
    y: wall.row * (pathW + wallW),
    horizontal: wall.horizontal,
    length: wall.length * (pathW + wallW)
  }));

// Vẽ các bức tường
walls.forEach(({ x, y, horizontal, length }) => {
    const wall = document.createElement("div");
    wall.setAttribute("class", "wall");
    wall.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${wallW}px;
        height: ${length}px;
        transform: rotate(${horizontal ? -90 : 0}deg);
    `;

    mazeElement.appendChild(wall);
});

const holes = [
    { column: 0, row: 5 },
    { column: 2, row: 0 },
    { column: 2, row: 4 },
    { column: 4, row: 6 },
    { column: 6, row: 2 },
    { column: 6, row: 8 },
    { column: 8, row: 1 },
    { column: 8, row: 2 }
].map((hole) => ({
    x: hole.column * (wallW + pathW) + (wallW / 2 + pathW / 2),
    y: hole.row * (wallW + pathW) + (wallW / 2 + pathW / 2)
}));

joystickHeadElement.addEventListener("mousedown", function (event) {
    if (!gameInProgress) {
        mouseStartX = event.clientX;
        mouseStartY = event.clientY;
        gameInProgress = true;
        window.requestAnimationFrame(main);
        noteElement.style.opacity = 0;
        joystickHeadElement.style.cssText = `
            animation: none;
            cursor: grabbing;
        `;
    }
});

window.addEventListener("mousemove", function (event) {
    if (gameInProgress) {
        const mouseDeltaX = -Math.minmax(mouseStartX - event.clientX, 15);
        const mouseDeltaY = -Math.minmax(mouseStartY - event.clientY, 15);

        joystickHeadElement.style.cssText = `
            left: ${mouseDeltaX}px;
            top: ${mouseDeltaY}px;
            animation: none;
            cursor: grabbing;
        `;

        const rotationY = mouseDeltaX * 0.8; // Độ xoay tối đa = 12
        const rotationX = mouseDeltaY * 0.8;

        mazeElement.style.cssText = `
            transform: rotateY(${rotationY}deg) rotateX(${-rotationX}deg)
        `;

        const gravity = 2;
        const friction = 0.01; // Hệ số ma sát

        accelerationX = gravity * Math.sin((rotationY / 180) * Math.PI);
        accelerationY = gravity * Math.sin((rotationX / 180) * Math.PI);
        frictionX = gravity * Math.cos((rotationY / 180) * Math.PI) * friction;
        frictionY = gravity * Math.cos((rotationX / 180) * Math.PI) * friction;
    }
});

window.addEventListener("keydown", function (event) {
    // Nếu không phải phím mũi tên, phím cách, hoặc phím H thì trả về
    if (![" ", "H", "h", "E", "e"].includes(event.key)) return;

    // Nếu nhấn phím mũi tên thì ngăn hành vi mặc định
    event.preventDefault();

    // Nếu nhấn phím cách thì khởi động lại trò chơi
    if (event.key == " ") {
        resetGame();
        return;
    }

    // Kích hoạt chế độ khó
    if (event.key == "H" || event.key == "h") {
        hardMode = true;
        resetGame();
        return;
    }

    // Kích hoạt chế độ dễ
    if (event.key == "E" || event.key == "e") {
        hardMode = false;
        resetGame();
        return;
    }
});

function resetGame() {
    previousTimestamp = undefined;
    gameInProgress = false;
    mouseStartX = undefined;
    mouseStartY = undefined;
    accelerationX = undefined;
    accelerationY = undefined;
    frictionX = undefined;
    frictionY = undefined;

    mazeElement.style.cssText = `
        transform: rotateY(0deg) rotateX(0deg)
    `;

    joystickHeadElement.style.cssText = `
        left: 0;
        top: 0;
        animation: glow;
        cursor: grab;
    `;

    if (hardMode) {
        noteElement.innerHTML = `Nhấn joystick để bắt đầu!
            <p>Chế độ khó, Tránh các lỗ đen. Quay về chế độ dễ? Nhấn E</p>`;
    } else {
        noteElement.innerHTML = `Nhấn joystick để bắt đầu!
            <p>Di chuyển tất cả các quả bóng vào giữa. Sẵn sàng cho chế độ khó? Nhấn H</p>`;
    }
    noteElement.style.opacity = 1;

    balls = [
        { column: 0, row: 0 },
        { column: 9, row: 0 },
        { column: 0, row: 8 },
        { column: 9, row: 8 }
    ].map((ball) => ({
        x: ball.column * (wallW + pathW) + (wallW / 2 + pathW / 2),
        y: ball.row * (wallW + pathW) + (wallW / 2 + pathW / 2),
        velocityX: 0,
        velocityY: 0
    }));

    if (ballElements.length) {
        balls.forEach(({ x, y }, index) => {
            ballElements[index].style.cssText = `left: ${x}px; top: ${y}px; `;
        });
    }

    // Xóa các lỗ đen trước đó
    holeElements.forEach((holeElement) => {
        mazeElement.removeChild(holeElement);
    });
    holeElements = [];

    // Đặt lại các lỗ đen nếu ở chế độ khó
    if (hardMode) {
        holes.forEach(({ x, y }) => {
            const ball = document.createElement("div");
            ball.setAttribute("class", "black-hole");
            ball.style.cssText = `left: ${x}px; top: ${y}px; `;

            mazeElement.appendChild(ball);
            holeElements.push(ball);
        });
    }
}

function main(timestamp) {
    // Có thể khởi động lại trò chơi giữa lúc đang chơi. Khi đó vòng lặp sẽ dừng lại
    if (!gameInProgress) return;

    if (previousTimestamp === undefined) {
        previousTimestamp = timestamp;
        window.requestAnimationFrame(main);
        return;
    }

    const maxVelocity = 1.5;

    // Thời gian đã trôi qua kể từ chu kỳ trước, chia cho 16
    // Hàm này được gọi mỗi 16ms nên chia cho 16 sẽ ra 1
    const timeElapsed = (timestamp - previousTimestamp) / 16;

    try {
      // Nếu chuột chưa di chuyển thì không làm gì cả
      if (accelerationX != undefined && accelerationY != undefined) {
          const velocityChangeX = accelerationX * timeElapsed;
          const velocityChangeY = accelerationY * timeElapsed;
          const frictionDeltaX = frictionX * timeElapsed;
          const frictionDeltaY = frictionY * timeElapsed;
  
          balls.forEach((ball) => {
              if (velocityChangeX == 0) {
                  // Không có sự xoay, mặt phẳng bằng phẳng
                  // Trên bề mặt bằng phẳng, ma sát chỉ có thể làm chậm lại, nhưng không thể đảo ngược chuyển động
                  ball.velocityX = slow(ball.velocityX, frictionDeltaX);
              } else {
                  ball.velocityX = ball.velocityX + velocityChangeX;
                  ball.velocityX = Math.max(Math.min(ball.velocityX, 1.5), -1.5);
                  ball.velocityX =
                      ball.velocityX - Math.sign(velocityChangeX) * frictionDeltaX;
                  ball.velocityX = Math.minmax(ball.velocityX, maxVelocity);
              }
  
              if (velocityChangeY == 0) {
                  // Không có sự xoay, mặt phẳng bằng phẳng
                  // Trên bề mặt bằng phẳng, ma sát chỉ có thể làm chậm lại, nhưng không thể đảo ngược chuyển động
                  ball.velocityY = slow(ball.velocityY, frictionDeltaY);
              } else {
                  ball.velocityY = ball.velocityY + velocityChangeY;
                  ball.velocityY =
                      ball.velocityY - Math.sign(velocityChangeY) * frictionDeltaY;
                  ball.velocityY = Math.minmax(ball.velocityY, maxVelocity);
              }
  
              // Vị trí tiếp theo của quả bóng, chỉ trở thành đúng nếu không xảy ra va chạm
              // Chỉ được sử dụng để kiểm tra va chạm, không có nghĩa là quả bóng sẽ đến vị trí này
              ball.nextX = ball.x + ball.velocityX;
              ball.nextY = ball.y + ball.velocityY;
  
              if (debugMode) console.log("tick", ball);
  
              walls.forEach((wall, wi) => {
                  if (wall.horizontal) {
                      // Tường ngang
  
                      if (
                          ball.nextY + ballSize / 2 >= wall.y - wallW / 2 &&
                          ball.nextY - ballSize / 2 <= wall.y + wallW / 2
                      ) {
                          // Quả bóng nằm trong dải tường
                          // (không nhất thiết phải va chạm, có thể là trước hoặc sau)
  
                          const wallStart = {
                              x: wall.x,
                              y: wall.y
                          };
                          const wallEnd = {
                              x: wall.x + wall.length,
                              y: wall.y
                          };
  
                          if (
                              ball.nextX + ballSize / 2 >= wallStart.x - wallW / 2 &&
                              ball.nextX < wallStart.x
                          ) {
                              // Quả bóng có thể va chạm với đầu bên trái của tường ngang
                              const distance = distance2D(wallStart, {
                                  x: ball.nextX,
                                  y: ball.nextY
                              });
                              if (distance < ballSize / 2 + wallW / 2) {
                                  if (debugMode && wi > 4)
                                      console.warn("quá gần h đầu", distance, ball);
  
                                  // Quả bóng va chạm với đầu bên trái của tường ngang
                                  const closest = closestItCanBe(wallStart, {
                                      x: ball.nextX,
                                      y: ball.nextY
                                  });
                                  const rolled = rollAroundCap(wallStart, {
                                      x: closest.x,
                                      y: closest.y,
                                      velocityX: ball.velocityX,
                                      velocityY: ball.velocityY
                                  });
  
                                  Object.assign(ball, rolled);
                              }
                          }
  
                          if (
                              ball.nextX - ballSize / 2 <= wallEnd.x + wallW / 2 &&
                              ball.nextX > wallEnd.x
                          ) {
                              // Quả bóng có thể va chạm với đuôi bên phải của tường ngang
                              const distance = distance2D(wallEnd, {
                                  x: ball.nextX,
                                  y: ball.nextY
                              });
                              if (distance < ballSize / 2 + wallW / 2) {
                                  if (debugMode && wi > 4)
                                      console.warn("quá gần h đuôi", distance, ball);
  
                                  // Quả bóng va chạm với đuôi bên phải của tường ngang
                                  const closest = closestItCanBe(wallEnd, {
                                      x: ball.nextX,
                                      y: ball.nextY
                                  });
                                  const rolled = rollAroundCap(wallEnd, {
                                      x: closest.x,
                                      y: closest.y,
                                      velocityX: ball.velocityX,
                                      velocityY: ball.velocityY
                                  });
  
                                  Object.assign(ball, rolled);
                              }
                          }
  
                          if (ball.nextX >= wallStart.x && ball.nextX <= wallEnd.x) {
                              // Quả bóng đã nằm bên trong thân chính của tường
                              if (ball.nextY < wall.y) {
                                  // Va chạm tường ngang từ trên xuống
                                  ball.nextY = wall.y - wallW / 2 - ballSize / 2;
                              } else {
                                  // Va chạm tường ngang từ dưới lên
                                  ball.nextY = wall.y + wallW / 2 + ballSize / 2;
                              }
                              ball.y = ball.nextY;
                              ball.velocityY = -ball.velocityY / 3;
  
                              if (debugMode && wi > 4)
                                  console.error("đi qua h dòng, VA CHẠM", ball);
                          }
                      }
                  } else {
                      // Tường dọc
  
                      if (
                          ball.nextX + ballSize / 2 >= wall.x - wallW / 2 &&
                          ball.nextX - ballSize / 2 <= wall.x + wallW / 2
                      ) {
                          // Quả bóng nằm trong dải tường
                          // (không nhất thiết phải va chạm, có thể là trước hoặc sau)
  
                          const wallStart = {
                              x: wall.x,
                              y: wall.y
                          };
                          const wallEnd = {
                              x: wall.x,
                              y: wall.y + wall.length
                          };
  
                          if (
                              ball.nextY + ballSize / 2 >= wallStart.y - wallW / 2 &&
                              ball.nextY < wallStart.y
                          ) {
                              // Quả bóng có thể va chạm với đầu bên trên của tường dọc
                              const distance = distance2D(wallStart, {
                                  x: ball.nextX,
                                  y: ball.nextY
                              });
                              if (distance < ballSize / 2 + wallW / 2) {
                                  if (debugMode && wi > 4)
                                      console.warn("quá gần v đầu", distance, ball);
  
                                  // Quả bóng va chạm với đầu bên trái của tường dọc
                                  const closest = closestItCanBe(wallStart, {
                                      x: ball.nextX,
                                      y: ball.nextY
                                  });
                                  const rolled = rollAroundCap(wallStart, {
                                      x: closest.x,
                                      y: closest.y,
                                      velocityX: ball.velocityX,
                                      velocityY: ball.velocityY
                                  });
  
                                  Object.assign(ball, rolled);
                              }
                          }
  
                          if (
                              ball.nextY - ballSize / 2 <= wallEnd.y + wallW / 2 &&
                              ball.nextY > wallEnd.y
                          ) {
                              // Quả bóng có thể va chạm với đuôi bên dưới của tường dọc
                              const distance = distance2D(wallEnd, {
                                  x: ball.nextX,
                                  y: ball.nextY
                              });
                              if (distance < ballSize / 2 + wallW / 2) {
                                  if (debugMode && wi > 4)
                                      console.warn("quá gần v đuôi", distance, ball);
  
                                  // Quả bóng va chạm với đầu bên phải của tường dọc
                                  const closest = closestItCanBe(wallEnd, {
                                      x: ball.nextX,
                                      y: ball.nextY
                                  });
                                  const rolled = rollAroundCap(wallEnd, {
                                      x: closest.x,
                                      y: closest.y,
                                      velocityX: ball.velocityX,
                                      velocityY: ball.velocityY
                                  });
  
                                  Object.assign(ball, rolled);
                              }
                          }
  
                          if (ball.nextY >= wallStart.y && ball.nextY <= wallEnd.y) {
                              // Quả bóng đã nằm bên trong thân chính của tường
                              if (ball.nextX < wall.x) {
                                  // Va chạm tường dọc từ bên trái
                                  ball.nextX = wall.x - wallW / 2 - ballSize / 2;
                              } else {
                                  // Va chạm tường dọc từ bên phải
                                  ball.nextX = wall.x + wallW / 2 + ballSize / 2;
                              }
                              ball.x = ball.nextX;
                              ball.velocityX = -ball.velocityX / 3;
  
                              if (debugMode && wi > 4)
                                  console.error("đi qua v dòng, VA CHẠM", ball);
                          }
                      }
                  }
              });
  
              // Kiểm tra xem quả bóng có rơi vào lỗ đen hay không
              if (hardMode) {
                  holes.forEach((hole, hi) => {
                      const distance = distance2D(hole, {
                          x: ball.nextX,
                          y: ball.nextY
                      });
  
                      if (distance <= holeSize / 2) {
                          // Quả bóng đã rơi vào lỗ đen
                          holeElements[hi].style.backgroundColor = "red";
                          throw Error("Quả bóng đã rơi vào lỗ đen");
                      }
                  });
              }
  
              // Điều chỉnh metadata của quả bóng
              ball.x = ball.x + ball.velocityX;
              ball.y = ball.y + ball.velocityY;
          });
  
          // Di chuyển quả bóng đến vị trí mới trên giao diện người dùng
          balls.forEach(({ x, y }, index) => {
              ballElements[index].style.cssText = `left: ${x}px; top: ${y}px; `;
          });
      }
  
      // Kiểm tra chiến thắng
      if (
          balls.every(
              (ball) => distance2D(ball, { x: 350 / 2, y: 315 / 2 }) < 65 / 2
          )
      ) {
          noteElement.innerHTML = `Chúc mừng, bạn đã làm được điều đó!
            ${!hardMode ? "<p>Nhấn H để chuyển sang chế độ khó</p>" : ""}`;
          noteElement.style.opacity = 1;
          gameInProgress = false;
      } else {
          previousTimestamp = timestamp;
          window.requestAnimationFrame(main);
      }
  } catch (error) {
      if (error.message == "Quả bóng đã rơi vào lỗ đen") {
          noteElement.innerHTML = `Một quả bóng đã rơi vào lỗ đen! Nhấn phím cách để khởi động lại trò chơi.
            <p>
              Quay lại chế độ dễ? Nhấn E
            </p>`;
          noteElement.style.opacity = 1;
          gameInProgress = false;
      } else throw error;
  }
}  
  