import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.Random;

public class FlappyBird extends JPanel implements ActionListener, KeyListener {
    // Game window dimensions
    private int width = 800;
    private int height = 600;

    // Game timer
    private Timer timer;
    private int delay = 20; // 20ms delay (50 FPS)

    // Bird properties
    private int birdY = height / 2;
    private final int birdX = width / 5;
    private final int birdSize = 20;
    private int birdVelocity = 0;
    private final int gravity = 1;

    // Pipe properties
    private ArrayList<Rectangle> pipes = new ArrayList<>();
    private final int pipeWidth = 50;
    private final int pipeGap = 200;
    private final int pipeVelocity = 3;

    // Game state
    private int score = 0;
    private boolean gameOver = false;
    private Random random = new Random();

    // Debugging properties
    private boolean debugMode = true;
    private long lastUpdateTime = 0;
    private int frameCount = 0;
    private double fps = 0;

    // Scoring system
    private ArrayList<Integer> scoredPipes = new ArrayList<>();

    public FlappyBird() {
        // Set up the game panel
        setPreferredSize(new Dimension(width, height));
        setBackground(Color.cyan);
        
        // Initialize the game timer
        timer = new Timer(delay, this);
        
        // Set up keyboard input
        addKeyListener(this);
        setFocusable(true);
        setFocusTraversalKeysEnabled(false);
    }

    public void startGame() {
        // Reset game state
        birdY = height / 2;
        birdVelocity = 0;
        pipes.clear();
        scoredPipes.clear();
        score = 0;
        gameOver = false;
        
        // Add the first pipe and start the game timer
        addPipe();
        timer.start();
        lastUpdateTime = System.currentTimeMillis();
    }

    public void addPipe() {
        // Generate a random height for the pipe
        int pipeHeight = 100 + random.nextInt(height - pipeGap - 200);
        
        // Add top and bottom pipes
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

        // Draw game over message
        if (gameOver) {
            g.setColor(Color.RED);
            g.setFont(new Font("Arial", Font.BOLD, 40));
            g.drawString("Game Over!", width / 2 - 100, height / 2);
            g.setFont(new Font("Arial", Font.BOLD, 20));
            g.drawString("Press SPACE to restart", width / 2 - 100, height / 2 + 40);
        }

        // Draw debug information
        if (debugMode) {
            g.setColor(Color.BLACK);
            g.setFont(new Font("Arial", Font.PLAIN, 12));
            g.drawString(String.format("FPS: %.2f", fps), width - 100, 20);
            g.drawString("Bird Y: " + birdY, width - 100, 40);
            g.drawString("Bird Velocity: " + birdVelocity, width - 100, 60);
            g.drawString("Pipes: " + pipes.size(), width - 100, 80);
            g.drawString("Scored Pipes: " + scoredPipes.size(), width - 100, 100);
        }
    }

    public void actionPerformed(ActionEvent e) {
        // Calculate FPS
        frameCount++;
        long currentTime = System.currentTimeMillis();
        if (currentTime - lastUpdateTime >= 1000) {
            fps = (double) frameCount / ((currentTime - lastUpdateTime) / 1000.0);
            frameCount = 0;
            lastUpdateTime = currentTime;
        }

        if (!gameOver) {
            // Update bird position
            birdVelocity += gravity;
            birdY += birdVelocity;

            // Move pipes and update score
            for (int i = 0; i < pipes.size(); i += 2) {
                Rectangle topPipe = pipes.get(i);
                Rectangle bottomPipe = pipes.get(i + 1);
                
                // Move pipes to the left
                topPipe.x -= pipeVelocity;
                bottomPipe.x -= pipeVelocity;

                // Update score when passing a pipe
                if (topPipe.x + topPipe.width < birdX && !scoredPipes.contains(i)) {
                    score += 100; // Increment score by 100 points
                    scoredPipes.add(i);
                }

                // Remove pipes that are off the screen
                if (topPipe.x + topPipe.width < 0) {
                    pipes.remove(i);
                    pipes.remove(i);
                    scoredPipes.remove(Integer.valueOf(i));
                    i -= 2;
                }
            }

            // Add new pipes when necessary
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

        // Repaint the game panel
        repaint();
    }

    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_SPACE) {
            if (gameOver) {
                startGame(); // Restart the game if it's over
            } else {
                birdVelocity = -10; // Make the bird jump
            }
        } else if (e.getKeyCode() == KeyEvent.VK_D) {
            debugMode = !debugMode; // Toggle debug mode
        }
    }

    // Unused KeyListener methods
    public void keyTyped(KeyEvent e) {}
    public void keyReleased(KeyEvent e) {}

    public static void main(String[] args) {
        // Set up the game window
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