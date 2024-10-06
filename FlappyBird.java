import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.Random;

public class FlappyBird extends JPanel implements ActionListener, KeyListener {
    private int width = 800;
    private int height = 600;
    private Timer timer;
    private int delay = 20;

    private int birdY = height / 2;
    private int birdX = width / 5;
    private int birdSize = 20;
    private int birdVelocity = 0;
    private int gravity = 1;

    private ArrayList<Rectangle> pipes = new ArrayList<>();
    private int pipeWidth = 50;
    private int pipeGap = 200;
    private int pipeVelocity = 3;

    private int score = 0;
    private boolean gameOver = false;
    private Random random = new Random();

    // Debugging variables
    private boolean debugMode = true;
    private long lastUpdateTime = 0;
    private int frameCount = 0;
    private double fps = 0;

    public FlappyBird() {
        setPreferredSize(new Dimension(width, height));
        setBackground(Color.cyan);
        timer = new Timer(delay, this);
        addKeyListener(this);
        setFocusable(true);
        setFocusTraversalKeysEnabled(false);
    }

    public void startGame() {
        birdY = height / 2;
        birdVelocity = 0;
        pipes.clear();
        score = 0;
        gameOver = false;
        addPipe();
        timer.start();
        lastUpdateTime = System.currentTimeMillis();
    }

    public void addPipe() {
        int pipeHeight = 100 + random.nextInt(height - pipeGap - 200);
        pipes.add(new Rectangle(width, height - pipeHeight, pipeWidth, pipeHeight));
        pipes.add(new Rectangle(width, 0, pipeWidth, height - pipeHeight - pipeGap));
    }

    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        
        // Draw bird (red dot)
        g.setColor(Color.RED);
        g.fillOval(birdX, birdY, birdSize, birdSize);

        // Draw pipes
        g.setColor(Color.GREEN);
        for (Rectangle pipe : pipes) {
            g.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        }

        // Draw score
        g.setColor(Color.BLACK);
        g.setFont(new Font("Arial", Font.BOLD, 20));
        g.drawString("Score: " + score, 10, 30);

        if (gameOver) {
            g.setColor(Color.RED);
            g.setFont(new Font("Arial", Font.BOLD, 40));
            g.drawString("Game Over!", width / 2 - 100, height / 2);
            g.setFont(new Font("Arial", Font.BOLD, 20));
            g.drawString("Press SPACE to restart", width / 2 - 100, height / 2 + 40);
        }

        if (debugMode) {
            g.setColor(Color.BLACK);
            g.setFont(new Font("Arial", Font.PLAIN, 12));
            g.drawString(String.format("FPS: %.2f", fps), width - 100, 20);
            g.drawString("Bird Y: " + birdY, width - 100, 40);
            g.drawString("Bird Velocity: " + birdVelocity, width - 100, 60);
            g.drawString("Pipes: " + pipes.size(), width - 100, 80);
        }
    }

    public void actionPerformed(ActionEvent e) {
        frameCount++;
        long currentTime = System.currentTimeMillis();
        if (currentTime - lastUpdateTime >= 1000) {
            fps = (double) frameCount / ((currentTime - lastUpdateTime) / 1000.0);
            frameCount = 0;
            lastUpdateTime = currentTime;
        }

        if (!gameOver) {
            birdVelocity += gravity;
            birdY += birdVelocity;

            // Move pipes
            for (int i = 0; i < pipes.size(); i++) {
                Rectangle pipe = pipes.get(i);
                pipe.x -= pipeVelocity;

                if (pipe.x + pipe.width < 0) {
                    pipes.remove(i);
                    i--;
                    if (i % 2 == 0) {
                        score++;
                    }
                }
            }

            // Add new pipes
            if (pipes.isEmpty() || pipes.get(pipes.size() - 1).x < width - 300) {
                addPipe();
            }

            // Check for collisions
            Rectangle bird = new Rectangle(birdX, birdY, birdSize, birdSize);
            for (Rectangle pipe : pipes) {
                if (bird.intersects(pipe)) {
                    gameOver = true;
                }
            }

            // Check if bird is out of bounds
            if (birdY > height - birdSize || birdY < 0) {
                gameOver = true;
            }
        }

        repaint();
    }

    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_SPACE) {
            if (gameOver) {
                startGame();
            } else {
                birdVelocity = -10;
            }
        } else if (e.getKeyCode() == KeyEvent.VK_D) {
            debugMode = !debugMode;
        }
    }

    public void keyTyped(KeyEvent e) {}
    public void keyReleased(KeyEvent e) {}

    public static void main(String[] args) {
        JFrame frame = new JFrame("Flappy Bird");
        FlappyBird game = new FlappyBird();
        frame.add(game);
        frame.pack();
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
        game.startGame();
    }
}