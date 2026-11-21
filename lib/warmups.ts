import type { Question } from "./content.ts";

const t = String.raw;
function warmup(read: string, example: string, prompt: string, choices: string[], answer: number, explanation: string,
  calculation: string, value: number, reasoning: string) {
  return {
    read, example,
    questions: [
      { kind: "choice", prompt, choices, answer, explanation },
      { kind: "number", prompt: calculation, answer: value, explanation: reasoning },
    ] satisfies Question[],
  };
}

export const warmups: Record<string, ReturnType<typeof warmup>> = {
  eigenvalues: warmup(
    t`A vector is an ordered list of numbers, often written as a column. A matrix is a table that transforms the list. For each row, multiply entries in the same positions, then add. In $Av=\lambda v$, $A$ is the matrix, $v$ the nonzero input column, and $\lambda$ (lambda) is a number multiplying every entry. The equation asks which arrows keep their line, including arrows that reverse. Later, $I$ means the identity matrix, with ones on the diagonal and zeros elsewhere. A two-by-two determinant multiplies the main diagonal entries and subtracts the other diagonal product.`,
    t`For $A=\begin{pmatrix}2&3\\0&5\end{pmatrix}$ and $v=(1,1)$, the rows give $2(1)+3(1)=5$ and $0(1)+5(1)=5$. So $Av=(5,5)=5v$. The eigenvalue for this arrow is $5$.`,
    t`In $Av=\lambda v$, which symbol represents a single scale factor?`, [t`$A$`, t`$v$`, t`$\lambda$`], 2, "Lambda is a single number. The matrix is the table and the vector is the list.",
    t`The first row of a matrix is $(2,4)$. Its input column is $(1,2)$. What is the first output coordinate?`, 10,
    t`Pair positions and add. The two terms are $2\cdot1$ and $4\cdot2$, giving $10$.`),
  eigenvectors: warmup(
    t`To rescale a vector to length one, divide every coordinate by the same positive length. For real coordinates $(x,y)$ the length is $\sqrt{x^2+y^2}$ by the Pythagorean theorem. The superscript $\dagger$ means turn a column into a row and conjugate every complex entry.`,
    t`The vector $(0,-3)$ has length three. Dividing both entries by three gives $(0,-1)$, still pointing in the negative direction.`,
    "What changes when you normalize a nonzero vector?", ["Only its length", "Only the sign of every entry", "Only its direction"], 0,
    "Dividing every coordinate by the same positive number preserves direction.",
    t`What is the length of $(6,8)$ before it is normalized?`, 10,
    t`The squares add to $36+64=100$. Taking the positive square root gives $10$.`),
  operators: warmup(
    t`A ket, written $|b\rangle$, is a column vector. For a qubit, $|0\rangle$ and $|1\rangle$ are the two standard basis columns. Their coefficients are amplitudes and can be complex. The imaginary unit $i$ satisfies $i^2=-1$ and has magnitude one. A bra $\langle b|$ is the matching conjugated row, so $\langle b|\psi\rangle$ picks out an amplitude of state $|\psi\rangle$. A Z (computational-basis) measurement squares the magnitudes of those coefficients.`,
    t`The ket $(3|0\rangle+4i|1\rangle)/5$ has coefficients $3/5$ and $4i/5$. Measuring in Z gives probabilities $9/25$ and $16/25$, which add to one.`,
    t`What does $\langle1|\psi\rangle$ give you in the computational basis?`, ["The amplitude of outcome 1", "The squared magnitude of outcome 1", "The sum of both amplitudes"], 0,
    "Applying the bra picks out one amplitude. The magnitude-squared step converts it to a probability.",
    t`What is the probability of 0 in Z if the coefficient of $|0\rangle$ is $-3/5$?`, 0.36,
    t`The magnitude is $3/5$. Its square is $9/25=0.36$.`),
  hamiltonians: warmup(
    t`The Hamiltonian $H$ is a matrix representing energy. If $H|E\rangle=E|E\rangle$, the state $|E\rangle$ has definite energy $E$. The ground energy is the smallest of the allowed energies. A diagonal matrix scales each basis column by the corresponding diagonal entry. $I$ keeps either column unchanged and $Z$ changes the sign of $|1\rangle$ only.`,
    t`A Hamiltonian with diagonal $(2,-4)$ gives energy $2$ on $|0\rangle$ and $-4$ on $|1\rangle$. Its ground energy is $-4$.`,
    "A Z operator acts on the basis ket for bit 0. What happens?", ["It keeps the ket", "It flips the bit", "It makes the ket zero"], 0, "Z gives a factor of +1 on the first basis ket.",
    t`What is the ground energy of a Hamiltonian with diagonal $(3,-7)$?`, -7, "Read the two diagonal entries as separate energy levels and take the smaller one."),
  metrics: warmup(
    t`A metric tells you how much a small step counts as movement. $\theta$ (theta) labels a control setting and $\delta\theta$ is a tiny change to it. In one coordinate with metric coefficient $g$, the squared length is $\ell^2=g(\delta\theta)^2$. To get ordinary length $\ell$, take the nonnegative square root. In two coordinates you may see a matrix $G$. Each row times the step column gives one output coordinate. A superscript $\mathsf T$ writes a column as a row.`,
    t`Take $g=4$ and $\delta\theta=0.5$. The squared length is $4(0.5)^2=1$ and the length is $1$. For a row-times-column example, row $(1,0.3)$ acting on $(1,-1)$ gives $1(1)+0.3(-1)=0.7$.`,
    t`In $\ell^2=g(\delta\theta)^2$, which symbol is your change to the control setting?`, [t`$\ell$`, t`$g$`, t`$\delta\theta$`], 2, "Delta theta is the input change. The metric coefficient measures how much that change counts.",
    t`With $g=4$ and $\delta\theta=0.25$, what is the squared length?`, 0.25,
    t`Square the displacement to get $0.0625$, then multiply by $4$ to get $0.25$.`),
  "state-geometry": warmup(
    t`A ray is the collection of unit vectors that differ only by one overall phase, a complex multiplier of magnitude one. A relative phase changes the relation between coefficients and can affect interference. Overlap is the inner product of two states. Its magnitude lies between zero and one. The Fubini–Study angle takes the inverse cosine of that magnitude.`,
    t`The kets $|1\rangle$ and $i|1\rangle$ have overlap $i$. Its magnitude is one, giving angle zero. By comparison, $|0\rangle$ and $|1\rangle$ have zero overlap and are perpendicular.`,
    t`What kind of phase multiplies every coefficient by the same number?`, ["Relative phase", "Global phase"], 1, "One common factor is global. A relative phase compares different coefficients.",
    t`The overlap of two unit kets is $-i$. What is its magnitude?`, 1, "The imaginary unit has magnitude one. The sign does not change its magnitude."),
  fisher: warmup(
    t`A Bernoulli trial has two possible outputs. Their probabilities add up to one. A derivative, written $p'(\theta)$ or $\partial_\theta p$, tells you how fast a probability $p$ changes when the parameter $\theta$ increases slightly. Opposite probability changes balance so the total stays one.`,
    t`If $p_1=0.3$ and its derivative is $0.1$, then $p_0=0.7$ and its derivative is $-0.1$. The rates add to zero.`,
    "If the probability of outcome 1 increases in a two-outcome experiment, what happens to the probability of outcome 0?", ["It increases", "It decreases", "It stays fixed"], 1, "The probabilities must keep summing to one, so the other one decreases by the same amount.",
    t`If $p_1=0.2$, what is $p_0$?`, 0.8, "Subtract the known probability from one."),
  singular: warmup(
    t`$\operatorname{diag}(a,b)$ is a matrix with $a,b$ on its main diagonal and zeros elsewhere. It scales the first coordinate by $a$ and the second by $b$. Its kernel is the set of vectors it sends to zero. Nullity is the dimension of that set.`,
    t`For $\operatorname{diag}(0,4)$ any vector $(x,0)$ maps to zero. Only $x$ is free, so the nullity is one.`,
    "Which entry of a diagonal matrix allows a coordinate to vary freely while keeping the output zero?", ["A positive entry", "A zero entry", "A negative entry"], 1, "Only multiplying by zero removes every possible contribution of that coordinate.",
    t`Compute the second output coordinate of $\operatorname{diag}(0,5)$ applied to $(2,3)$.`, 15, "The second diagonal entry multiplies the second input coordinate, giving fifteen."),
  "natural-gradient": warmup(
    t`A loss is a number we aim to reduce. Its derivative $g$ is the local slope, or change in loss per change in the input. For one coordinate, the ordinary downhill step is $-\eta g$, where $\eta$ is a positive step size. With a positive metric coefficient $G$, the natural step solves $G\delta=-\eta g$, with $\delta$ the signed displacement.`,
    t`If $g=6$, $\eta=0.1$, and $G=3$, the ordinary step is $-0.6$. Solving $3\delta=-0.6$ makes the natural step $-0.2$.`,
    "If the local loss slope is positive, which direction is initially downhill?", ["Increasing the coordinate", "Decreasing the coordinate"], 1, "Moving to a smaller coordinate reduces a loss with positive local slope.",
    t`Solve $4\delta=-2$ for the step $\delta$.`, -0.5, "Divide both sides by four and retain the negative sign."),
  circuits: warmup(
    t`A gate changes a quantum state. A circuit says which gates act and in which order. In Qiskit, qubit 0 is the last written bit of a state label. In $\mathrm{CX}$, the control's bit value determines whether to flip the target. A shot is one repetition followed by measurement.`,
    t`In a two-qubit register, applying $X$ to qubit 0 of $|00\rangle$ makes $|01\rangle$. A controlled flip from qubit 0 to qubit 1 then makes $|11\rangle$.`,
    t`Which gate flips one bit whenever it acts on a computational-basis ket?`, [t`$Z$`, t`$X$`, "Measurement"], 1, "X exchanges the two computational-basis kets. Z changes a sign.",
    "Across 20 ideal measurements, an outcome has probability 0.2. What is its expected count?", 4,
    "Each shot contributes 0.2 in expectation. Multiply by twenty."),
  algorithms: warmup(
    t`A phase in turns describes where you are in a cycle. Phase estimation uses qubits to store the phase as a binary fraction. Separately, VQE estimates an average energy of a trial state. To take a weighted average, multiply each outcome by its probability and sum the products.`,
    t`If a trial state has energy $-4$ with probability $1/2$ and energy $2$ with probability $1/2$, its average is $(-4)/2+2/2=-1$.`,
    "A phase is increased by one full turn. What happens to its position in the cycle?", ["It returns to the same position", "It reverses", "It moves half a turn"], 0, "A full turn comes back to the original position.",
    "Outcomes 2 and 6 are equally probable. What is their mean?", 4, "Use one half of each value and add."),
  hardware: warmup(
    t`A shot is one circuit run with a measured outcome. If outcome 1 is reported $n$ times in $N$ trials, its sample proportion is $n/N$. Repeating independent trials reduces sampling variation. A consistent detector bias can remain even when the proportion becomes very precise.`,
    t`In 40 runs, 6 outcomes labeled 1 give an observed proportion of $6/40=0.15$. A second batch can give a different count even with the same probabilities.`,
    "Which description fits a consistent detector bias?", ["The detector systematically misreports some labels", "The recorded count must be identical in each batch"], 0,
    "Detector bias is a systematic change to the observed distribution. Shot variation describes fluctuations around it.",
    "In 20 shots, outcome 1 is observed 7 times. What is its sample proportion?", 0.35, "Divide the number of successes by the total number of shots."),
};
