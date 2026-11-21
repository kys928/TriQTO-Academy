export const domains = [
  { id: "foundations", name: "Quantum Foundations", full: "Quantum Mechanics & Mathematics", short: "Foundations", roman: "I", description: "The language of states, operators, and energy." },
  { id: "computing", name: "Quantum Computing", full: "Quantum Computing", short: "Computing", roman: "II", description: "Circuits, algorithms, and real hardware." },
  { id: "geometry", name: "Geometry & TriQTO", full: "Differential Geometry & TriQTO", short: "Geometry", roman: "III", description: "How circuits move through state and probability space." },
] as const;

export type Domain = typeof domains[number]["id"];
export type Question = {
  prompt: string;
  kind: "choice" | "number" | "step" | "mistake" | "match";
  choices?: string[];
  answer: number | number[];
  tolerance?: number;
  pairs?: string[];
  explanation: string;
};
export type Lesson = {
  id: string; domain: Domain; title: string; summary: string; minutes: number;
  intuition: string; concept: string; math: string; example: string; sources: string[];
  lab?: "metric" | "rotation" | "phase";
  code?: string; questions: Question[];
};
const t = String.raw;
const choice = (prompt: string, choices: string[], answer: number, explanation: string, kind: "choice" | "step" | "mistake" = "choice"): Question => ({ prompt, choices, answer, explanation, kind });
const num = (prompt: string, answer: number, explanation: string, tolerance = 1e-8): Question => ({ prompt, answer, explanation, tolerance, kind: "number" });
const match = (prompt: string, pairs: string[], choices: string[], answer: number[], explanation: string): Question => ({ prompt, pairs, choices, answer, explanation, kind: "match" });

const pilot = "TriQTO Apprenticeship, Pilot Lesson 01 (revised student edition)";
const sung = "Kevin J. Sung, Quantum Mechanics for Computation (IBM QGSS 2026)";
const kirby = "Will Kirby, Quantum Algorithms I: Quantum Simulation of Physical Systems (IBM QGSS 2026)";
const paper = (section: string) => "TriQTO Final Hypothesis Paper, " + section;
const geom = "Stokes et al., Quantum Natural Gradient, §§2–3 (2020, arXiv:1909.02108)";
const gates = "Ibrahim Shehzad, Programming Quantum Computers (IBM QGSS 2026)";
const noise = "Haimeng Zhang, Noise, Hardware, and Reality (IBM QGSS 2026)";

export const lessons: Lesson[] = [
{
id:"eigenvalues", domain:"foundations", title:"Eigenvalues", summary:"Find the scale factors a matrix assigns to its special directions.", minutes:9, sources:[pilot, sung],
intuition:t`A linear map can mix coordinates. Along certain lines it only stretches, shrinks, or reverses the vector. An eigenvalue is the signed scale factor on one of those lines. The same algebra later finds energy levels and identifies directions a circuit hardly responds to.`,
concept:t`Start with a square matrix $A$ and a nonzero vector $v$. The equation $Av=\lambda v$ is linear in $v$ when the scalar $\lambda$ is fixed. Subtract $\lambda Iv$ to get a homogeneous system. A nonzero solution exists exactly when $A-\lambda I$ has a nontrivial kernel, or equivalently when its determinant vanishes.`,
math:t`$$\det(A-\lambda I)=(a-\lambda)(d-\lambda)-bc=0,\qquad A=\begin{pmatrix}a&b\\c&d\end{pmatrix}.$$
The identity $I$ keeps the coordinates of $v$ unchanged, so shifting by $\lambda I$ affects only diagonal entries. For a triangular matrix the product of the shifted diagonal entries gives the eigenvalues directly.`,
example:t`Take $A=\begin{pmatrix}4&1\\1&4\end{pmatrix}$. The determinant is $(4-\lambda)^2-1=(3-\lambda)(5-\lambda)$. The spectrum is $3,5$. Indeed $A(1,1)^{\mathsf T}=5(1,1)^{\mathsf T}$, while $A(1,-1)^{\mathsf T}=3(1,-1)^{\mathsf T}$. The original matrix has determinant $15$. Each shifted matrix is singular at its corresponding root.`,
questions:[
num(t`Find the larger eigenvalue of $\begin{pmatrix}6&2\\2&6\end{pmatrix}$.`,8,t`$(6-\lambda)^2=4$, so $\lambda$ is $6+2=8$ or $6-2=4$.`),
choice(t`Which equation allows a nonzero solution for $v$?`,[t`$\det A=0$ for every eigenvalue`,t`$\det(A-\lambda I)=0$`,t`$\det(A+\lambda I)=1$`,t`$\lambda=\operatorname{tr}A$ always`],1,t`The equation $(A-\lambda I)v=0$ needs a singular coefficient matrix. $\det A=0$ would specifically imply a zero eigenvalue.`,"step"),
choice(t`A student subtracts $\lambda$ from all four entries of $A$. Which correction is needed?`,["Subtract only from the off-diagonal entries.","Add it to every entry.","Subtract only on the diagonal.","Subtract only from the first row."],2,t`The shift is $\lambda I$, whose off-diagonal entries are zero.`,"mistake"),
num(t`Find the smaller eigenvalue of $\begin{pmatrix}7&10\\0&-2\end{pmatrix}$.`,-2,t`The determinant of the shift factors as $(7-\lambda)(-2-\lambda)$. The upper-right entry multiplies a zero in the determinant.`),
num(t`A symmetric $2\times2$ matrix has trace $7$ and determinant $10$. Find its smaller eigenvalue.`,2,t`The characteristic polynomial is $\lambda^2-7\lambda+10=(\lambda-2)(\lambda-5)$. The trace gives the sum and the determinant gives the product.`),
]},
{
id:"eigenvectors",domain:"foundations",title:"Eigenvectors",summary:"Recover and normalize the directions behind the eigenvalues.",minutes:10,sources:[pilot,sung],
intuition:t`Knowing a matrix has scales $3$ and $5$ tells you very little about where those scales act. An eigenvector identifies one direction. Normalizing fixes its length so later comparisons concern equal coordinate steps.`,
concept:t`For each eigenvalue solve the homogeneous system $(A-\lambda I)v=0$. Its solution space is the eigenspace, which includes zero. Any nonzero vector in it qualifies as an eigenvector. For a real symmetric matrix, eigenspaces with different eigenvalues are orthogonal. For complex vectors, use the conjugate transpose $v^\dagger$ to compute lengths.`,
math:t`$$u=\frac{v}{\sqrt{v^\dagger v}},\qquad A u=\frac{Av}{\sqrt{v^\dagger v}}=\lambda u.$$
For a real symmetric $A$, $(Au)^{\mathsf T}w=u^{\mathsf T}Aw$ implies $(\lambda-\mu)u^{\mathsf T}w=0$ when the vectors have eigenvalues $\lambda,\mu$. If the eigenvalues differ, the inner product vanishes.`,
example:t`For $A=\begin{pmatrix}4&-2\\-2&4\end{pmatrix}$ and $\lambda=2$, the shifted first row gives $2x-2y=0$. Choose $x=y=1$, then $u=(1,1)/\sqrt2$. Direct multiplication gives $(4-2,-2+4)/\sqrt2=(2,2)/\sqrt2=2u$. For $\lambda=6$ the first row instead gives $x=-y$.`,
questions:[
choice(t`Which vector spans the $\lambda=7$ eigenspace of $\begin{pmatrix}5&2\\2&5\end{pmatrix}$?`,[t`$(1,-1)$`,t`$(1,0)$`,t`$(2,1)$`,t`$(1,1)$`],3,t`The shifted row is $-2x+2y=0$, which requires $x=y$.`),
num(t`What is the positive first component after normalizing $(3,-4)$? Enter a decimal or fraction.`,0.6,t`Its Euclidean length is $5$, so the normalized vector is $(3/5,-4/5)$.`),
choice("How can you verify a proposed normalized eigenvector?",[t`Show both $Au=\lambda u$ and $u^\dagger u=1$.`,t`Show only $\det A=\lambda$.`,t`Show only $Au=u$.`,t`Compare only the lengths of $Au$ and $u$.`],0,"The multiplication verifies the direction and its scale. The inner product verifies unit length."),
choice(t`A student divides $Av=\lambda v$ by $v$ component by component. What can go wrong?`,["Division always recovers the whole eigenspace.","Some components can be zero, and equality needs to hold for the whole vector.","Every real symmetric matrix has complex eigenvalues.","Every eigenvector must have equal components."],1,t`A zero entry would require division by zero. The shifted linear system works without dividing by entries.`,"mistake"),
choice(t`If $u$ and $w$ are independent eigenvectors with the same eigenvalue, what is true of $u+2w$?`,["It has twice the eigenvalue.","It is automatically a unit vector.","It has the same eigenvalue.","Its eigenvalue is zero."],2,t`Linearity gives $A(u+2w)=\lambda(u+2w)$. Independence ensures the sum is nonzero.`),
]},
{
id:"operators",domain:"foundations", title:"Quantum operators",summary:"Connect complex state vectors, measurement, and entanglement.",minutes:12,sources:[sung,"Thaddeus Pellegrini, Entanglement & Quantum Effects (IBM QGSS 2026)",paper("§§3–4")],
intuition:t`A qubit state assigns complex amplitudes to basis alternatives. To predict a measurement, first express the state in the chosen basis, then square the magnitudes of those amplitudes. Changing the basis can turn a relative phase into a measurable probability.`,
concept:t`An ideal qubit lives in the complex Hilbert space $\mathbb C^2$, a vector space with an inner product. A pure state is a unit vector up to global phase. A Hermitian observable has real eigenvalues and orthogonal eigenspaces. A projective measurement returns the eigenvalue associated with the selected eigenspace. A unitary gate preserves inner products. The Pauli matrices $X$ and $Z$ happen to be both Hermitian and unitary, so their role depends on how they are used.`,
math:t`$$p(a)=\langle\psi|\Pi_a|\psi\rangle,\qquad \mathbb E[A]=\sum_a a\,p(a).$$
Here $\Pi_a$ projects onto the eigenspace of outcome $a$. For a one-dimensional projector $|a\rangle\langle a|$, the probability is $|\langle a|\psi\rangle|^2$. Two qubits use a tensor-product space. A pure state is entangled when it cannot be factored into two one-qubit states.`,
example:t`For $|\psi\rangle=(|0\rangle+i|1\rangle)/\sqrt2$, a $Z$ measurement gives equal probabilities. For $X$, the amplitude of $|+\rangle=(|0\rangle+|1\rangle)/\sqrt2$ is $(1+i)/2$, so $p(+)=|1+i|^2/4=1/2$. If the relative phase is changed from $i$ to $1$, the state becomes $|+\rangle$, and $p(+)$ becomes $1$. This compares two physically distinct states with the same $Z$ probabilities.`,
questions:[
num(t`For $(|0\rangle+i\sqrt3|1\rangle)/2$, find $p_Z(1)$.`,0.75,t`The $|1\rangle$ amplitude has magnitude $\sqrt3/2$. Square that magnitude to get $3/4$.`),
num(t`What is $\langle Z\rangle$ if $p_Z(0)=0.2$? Use eigenvalues $+1$ for $0$ and $-1$ for $1$.`,-0.6,t`$\langle Z\rangle=0.2-0.8=-0.6$.`),
choice(t`Which pure state is entangled?`,[t`$|00\rangle$`,t`$(|00\rangle+|01\rangle)/\sqrt2$`,t`$(|00\rangle+|11\rangle)/\sqrt2$`,t`$|+\rangle\otimes|-\rangle$`],2,t`A product state with nonzero $00$ and $11$ amplitudes would also have nonzero cross amplitudes. The Bell state has zero cross amplitudes.`),
match("Match each expression to its role.",[t`$U^\dagger U=I$`,t`$A^\dagger=A$`,t`$|\langle b|\psi\rangle|^2$`],["Rank-one outcome probability","Unitarity condition","Hermiticity condition"],[1,2,0],"The first preserves inner products, the second gives a real observable spectrum, and the third applies the Born rule."),
num(t`Measure $(|0\rangle+e^{i\pi/3}|1\rangle)/\sqrt2$ in the $X$ basis. What is $p(+)$?`,0.75,t`The squared overlap is $(2+2\cos(\pi/3))/4=(1+1/2)/2=3/4$.`),
]},
{
id:"hamiltonians",domain:"foundations",title:"Hamiltonians",summary:"Read energy spectra and predict how relative phase evolves.",minutes:11,sources:[sung,kirby,pilot],
intuition:t`The Hamiltonian measures energy and generates time evolution. If a state has definite energy, evolution only multiplies it by a global phase. If it contains different energies, their phases accumulate at different rates and interference can change.`,
concept:t`For a closed system with a time-independent Hamiltonian $H$, write the initial state in an orthonormal energy eigenbasis. Each component advances independently under the time evolution operator. The energy outcomes remain fixed in distribution, even while measurements in other bases can oscillate.`,
math:t`$$H|E_j\rangle=E_j|E_j\rangle,\qquad i\hbar\frac{d}{dt}|\psi(t)\rangle=H|\psi(t)\rangle.$$
Writing $|\psi(t)\rangle=\sum_j c_j(t)|E_j\rangle$ reduces the differential equation to $i\hbar\dot c_j=E_jc_j$. Hence $c_j(t)=c_j(0)e^{-iE_jt/\hbar}$, or $U(t)=e^{-iHt/\hbar}$. The phase difference is controlled by the energy gap.`,
example:t`Use $\hbar=1$ and $H=Z$. Starting from $|+\rangle$, the evolved state is $(e^{-it}|0\rangle+e^{it}|1\rangle)/\sqrt2$. The $|+\rangle$ amplitude is $(e^{-it}+e^{it})/2=\cos t$. At $t=\pi/4$, $p_X(+)=1/2$; at every time $p_Z(0)=1/2$.`,
questions:[
num(t`What is the ground energy of $H=5I-2Z$?`,3,t`The energy of $|0\rangle$ is $5-2=3$. The energy of $|1\rangle$ is $5+2=7$.`),
choice(t`What does $H\mapsto H+cI$ do to closed-system evolution?`,["Changes all transition probabilities.","Flips the eigenvectors.","Multiplies the state by a common phase.","Removes all relative phase."],2,t`Because $I$ commutes with $H$, the extra factor is $e^{-ict/\hbar}$ for every component.`),
choice(t`Complete $U(t)|E\rangle=\ldots$ for time-independent $H$.`,[t`$e^{-iEt/\hbar}|E\rangle$`,t`$E|E\rangle$`,t`$e^{-Et/\hbar}|E\rangle$`,t`$|E+t\rangle$`],0,t`Since $H|E\rangle=E|E\rangle$, repeated application gives $H^n|E\rangle=E^n|E\rangle$. Substituting into every term of the exponential gives $U(t)|E\rangle=e^{-iEt/\hbar}|E\rangle$.`,"step"),
num(t`In units $\hbar=1$, take $H=2Z$, start in $|+\rangle$, and evolve for $t=\pi/8$. Find $p_X(+)$.`,0.5,t`Here $\langle+|U(t)|+\rangle=\cos(2t)$. Squaring at $2t=\pi/4$ gives $1/2$.`),
choice(t`If $H=2X$ and the input is $|0\rangle$, which energies can a measurement of $H$ return?`,[t`$0$ only`,t`$0$ and $2$`,t`$+2$ only`,t`$-2$ and $+2$, each with probability $1/2$`],3,t`The eigenstates are $|-\rangle$ and $|+\rangle$. Both overlaps with $|0\rangle$ have squared magnitude $1/2$. A zero expectation does not force a zero outcome.`),
]},
{
id:"metrics",domain:"geometry",title:"Metric Tensors",summary:"Measure how much a small step changes the system.",minutes:12,lab:"metric",sources:[pilot,paper("§§5–6"),geom],
intuition:t`Turning two circuit angles by the same amount can have very different effects. It matters whether the effects reinforce or cancel each other. A metric tells you how long a small displacement is in the geometry you chose.`,
concept:t`A smooth manifold is a space with local coordinates that fit together smoothly. A metric assigns an inner product to tangent vectors at each point. Its matrix $G$ is symmetric and positive definite for a Riemannian metric. A pullback can be positive semidefinite because a parameter direction can disappear under the map. Off-diagonal terms describe how coordinate directions combine. The eigenvectors of a real symmetric metric matrix give principal directions relative to the chosen Euclidean coordinate frame.`,
math:t`$$\|\delta\theta\|_G^2=\delta\theta^{\mathsf T}G\,\delta\theta,\qquad G=J^{\mathsf T}MJ.$$
The second equation pulls a downstream metric $M$ back through the Jacobian $J$: to first order the output displacement is $J\delta\theta$. For a Euclidean-unit eigenvector $u$ with $Gu=\lambda u$, a step $\varepsilon u$ has squared length $\varepsilon^2\lambda$ and length $|\varepsilon|\sqrt\lambda$.`,
example:t`With $G=\begin{pmatrix}1&0.8\\0.8&1\end{pmatrix}$, $u_+=(1,1)/\sqrt2$ has eigenvalue $1.8$ and $u_-=(1,-1)/\sqrt2$ has eigenvalue $0.2$. For equal coordinate steps their metric lengths are in the ratio $\sqrt{1.8/0.2}=3$. The small-eigenvalue direction still moves the system. Let the coupling approach one in the lab to see when it becomes exactly null.`,
questions:[
num(t`For $G=\begin{pmatrix}1&0.99\\0.99&1\end{pmatrix}$, give the eigenvalue along $(1,-1)$.`,0.01,t`Multiplying row by column gives $G(1,-1)^{\mathsf T}=(1-0.99,0.99-1)^{\mathsf T}=(0.01,-0.01)^{\mathsf T}=0.01(1,-1)^{\mathsf T}$. The eigenvalue is $0.01$.`),
num(t`Find the determinant of that same matrix with diagonal $1$ and off-diagonal $0.99$.`,0.0199,t`$1-0.99^2=0.0199$. This equals the product $1.99(0.01)$.`),
choice(t`A unit eigenvector has $\lambda=9$. What is the metric length of a step $\varepsilon u$?`,[t`$9|\varepsilon|$`,t`$3|\varepsilon|$`,t`$9\varepsilon^2$`,t`$|\varepsilon|/3$`],1,t`The quadratic form gives $9\varepsilon^2$, which is squared length. Take the square root.`),
num(t`If $y=3x$ and the metric in $y$ is $dy^2$, what is the coefficient of $dx^2$ in the pullback?`,9,t`The Jacobian is $3$, and $dy^2=(3\,dx)^2=9\,dx^2$.`),
num(t`Two controls map to $(\theta_1-\theta_2,2\theta_2)$. The output metric is Euclidean. Compute the squared length of $\delta\theta=(1,1)$ using the pullback.`,4,t`The Jacobian sends $(1,1)$ to $(0,2)$. Its squared Euclidean length is $4$.`),
]},
{
id:"state-geometry",domain:"geometry",title:"Quantum-State Geometry",summary:"Use Fubini–Study geometry to separate physical motion from phase.",minutes:14,lab:"phase",sources:[pilot,paper("§§5–6.3"),geom],
intuition:t`Two unit state vectors can differ by an overall complex phase and represent the same physical pure state. A distance between physical pure states must identify those vectors. Relative phase can still move the state and change a suitable measurement.`,
concept:t`Pure states live in projective Hilbert space, where each ray identifies vectors related by global phase. Using the convention $d_{\rm FS}=\arccos|\langle\psi|\phi\rangle|$, orthogonal rays are $\pi/2$ apart. The quantum geometric tensor (QGT) measures infinitesimal changes of the ray. Its real part is the Fubini–Study metric in circuit coordinates, and the pure-state quantum Fisher information matrix is four times that metric under this convention.`,
math:t`$$Q_{ij}=\langle\partial_i\psi|(I-|\psi\rangle\langle\psi|)|\partial_j\psi\rangle,\qquad g_{ij}=\operatorname{Re}Q_{ij}.$$
The projector removes motion parallel to the current ray. For a unitary family generated by $K$, $\partial_\theta|\psi\rangle=-iK|\psi\rangle$, so the one-dimensional coefficient is $\langle K^2\rangle-\langle K\rangle^2$.`,
example:t`Take $R_y(\theta)|0\rangle=\cos(\theta/2)|0\rangle+\sin(\theta/2)|1\rangle$. The derivative is orthogonal to the state and has squared norm $1/4$, so $g_{\theta\theta}=1/4$. Compare $R_z(\theta)|0\rangle=e^{-i\theta/2}|0\rangle$: its derivative lies entirely along the original ray, yielding $g_{\theta\theta}=0$. Switching the input to $|+\rangle$ makes the same $R_z$ change a relative phase.`,
questions:[
num(t`Use the generator $Y/2$. What is the pure-state QFI of $R_y(\theta)|0\rangle$?`,1,t`The generator variance is $1/4$. Multiplying by $4$ gives QFI $1$.`),
choice(t`Why is $|\langle\psi|\phi\rangle|$ used in $d_{\rm FS}$?`,["It deletes all relative phase.","It makes the distance invariant under independent global phases.","It makes every pair of rays orthogonal.","It measures the classical frequency of any bitstring."],1,t`A global phase multiplies the overlap by a complex unit factor. The magnitude is unchanged.`),
num(t`Find $d_{\rm FS}(|0\rangle,|+\rangle)$ in radians.`,Math.PI/4,t`The overlap has magnitude $1/\sqrt2$, so the distance is $\pi/4\approx0.7854$.`,0.0005),
choice(t`Which step removes a derivative that is purely a global phase?`,[t`Multiply by $|\psi\rangle\langle\psi|$.`,t`Set all imaginary components to zero.`,t`Multiply by $I-|\psi\rangle\langle\psi|$.`,t`Divide by $\langle\psi|\psi\rangle$.`],2,t`The complementary projector annihilates the entire complex span of $|\psi\rangle$, including $i|\psi\rangle$.`,"step"),
num(t`For $R_z(\theta)(\sqrt3|0\rangle/2+|1\rangle/2)$, find $g_{\theta\theta}$. The generator is $Z/2$.`,0.1875,t`$\langle K\rangle=(3/4-1/4)/2=1/4$ and $\langle K^2\rangle=1/4$, so the variance is $1/4-1/16=3/16$.`),
]},
{
id:"fisher",domain:"geometry",title:"Fisher Information",summary:"Measure what a chosen experiment can distinguish.",minutes:12,lab:"phase",sources:[pilot,paper("§§4, 6.4–6.5"),geom],
intuition:t`Moving the circuit can change the quantum state while leaving the readout untouched. Classical Fisher information asks how strongly the outcome probabilities respond to the parameter you are trying to learn.`,
concept:t`For strictly positive probabilities, the score of outcome $y$ is $\partial_\theta\log p_y$. Fisher information is the expected squared score for one independent draw. It measures local statistical sensitivity in the chosen measurement. For $N$ independent identical shots, Fisher information adds. The Fisher–Rao metric on the interior of the probability simplex measures tangent displacements with weights $1/p_y$.`,
math:t`$$I(\theta)=\sum_y\frac{(\partial_\theta p_y)^2}{p_y},\qquad ds_{\rm FR}^2=\sum_y\frac{dp_y^2}{p_y}.$$
The tangent components sum to zero. The coordinates $2\sqrt{p_y}$ place the interior on a sphere of radius $2$, with the same line element. At zero probabilities, handle the model and limits explicitly rather than dividing by zero.`,
example:t`For $R_y(\theta)|0\rangle$ measured in $Z$, $p_1=\sin^2(\theta/2)$, $p_0=1-p_1$, and $p_1'=\sin\theta/2$. Thus $I=(p_1')^2/[p_1(1-p_1)]=1$ for $0<\theta<\pi$. For $R_z(\theta)|+\rangle$ measured in $Z$, both probabilities are always $1/2$, so $I_Z=0$ even though the pure-state QFI is $1$. In $X$, $p_+=(1+\cos\theta)/2$ and Fisher information is $1$ where both outcomes have positive probability.`,
questions:[
num(t`A Bernoulli model has $p_1=0.5$ and $\partial_\theta p_1=0.25$. Find its one-shot Fisher information.`,0.25,t`Both outcomes have derivative magnitude $0.25$. Their contributions sum to $2(0.25^2/0.5)=0.25$.`),
choice(t`If $I_Z=0$ for a relative-phase parameter, what follows?`,["The phase must be global.","The QFI is necessarily zero.","The Z readout has no first-order sensitivity there.","The Z readout has negative information."],2,t`A derivative of zero describes that fixed measurement. A different basis may carry information.`),
num(t`Each independent shot carries $I=0.4$. What is the Fisher information of $50$ shots?`,20,t`The total score is the sum of independent zero-mean scores. Its variance is $50(0.4)=20$.`),
choice("How should the displayed Fisher sum be used at a zero-probability outcome?",["Set its contribution to one in every model.","Replace the denominator with the number of shots.","Treat the outcome as certain evidence of error.","Check the model and the limiting calculation."],3,"The interior formula assumes positive probabilities. Support changes can require separate treatment.","mistake"),
num(t`At one point $(p_0,p_1,p_2)=(1/2,1/4,1/4)$ and $p'=(0,1/4,-1/4)$. Find $I$.`,0.5,t`The first term is zero. Each of the other terms is $(1/4)^2/(1/4)=1/4$.`),
]},
{
id:"singular",domain:"geometry",title:"Singular Metrics",summary:"Distinguish redundant controls from weak but real sensitivity.",minutes:12,lab:"metric",sources:[pilot,paper("§§4–6"),geom],
intuition:t`If a circuit depends only on the sum of two angles, increasing one while decreasing the other can leave the state exactly unchanged. The pullback then has a null direction. A direction with small positive sensitivity is different: it moves the state and can amplify noise when inverted.`,
concept:t`A matrix is singular if its determinant is zero, equivalently if it has a nontrivial kernel. For a symmetric positive semidefinite metric, diagonalize in an orthonormal basis. The Moore–Penrose pseudoinverse reciprocates the positive eigenvalues and assigns zero to zero modes. It gives the minimum-Euclidean-norm least-squares solution. A spectral cutoff additionally discards chosen small nonzero modes and deliberately changes the operator.`,
math:t`$$G^+=U\operatorname{diag}(\lambda_i^+)U^{\mathsf T},\quad \lambda_i^+=\begin{cases}1/\lambda_i&\lambda_i>0\\0&\lambda_i=0.\end{cases}$$
Adding a positive ridge $\mu I$ yields inverse weights $1/(\lambda_i+\mu)$, including $1/\mu$ in true null directions. This damps the small positive modes, but null components of the input should still be interpreted carefully. A null direction of a local pullback means first-order invisibility. Exact redundancy requires a stronger argument.`,
example:t`Take $\psi(\theta)=R_y(\theta_1+\theta_2)|0\rangle$. The Jacobian of the sum is $(1,1)$ and the state metric for that sum is $1/4$. Therefore $G=\frac14\begin{pmatrix}1&1\\1&1\end{pmatrix}$. Its eigenvalues are $1/2$ and $0$. On $u_+=(1,1)/\sqrt2$, $G^+$ multiplies by $2$. On $u_-=(1,-1)/\sqrt2$ it returns zero. The exact circuit dependence on the sum proves that moving along $u_-$ also leaves the state unchanged at finite step size.`,
questions:[
num(t`What is the nullity of $G=\operatorname{diag}(3,0,0)$?`,2,"The last two coordinate axes span its kernel, which has dimension two."),
num(t`For $G=\operatorname{diag}(2,0)$ and $b=(6,4)$, find the first component of $G^+b$.`,3,t`$G^+=\operatorname{diag}(1/2,0)$, so $G^+b=(3,0)$. The second entry of $b$ lies outside the range of $G$.`),
choice(t`A positive-semidefinite metric has a zero eigenvalue at one point. Which conclusion is justified?`,["The direction is globally redundant.","Every finite step in that direction has zero effect.","The whole matrix is zero.","The associated direction vanishes to first order in the chosen geometry."],3,t`For $y=x^2$ at $x=0$, the Jacobian is zero, yet finite nonzero $x$ changes $y$.`),
num(t`An eigenvalue is $0.01$ and the ridge coefficient is $0.09$. Give the inverse weight.`,10,t`$1/(0.01+0.09)=10$, versus the undamped weight $100$.`),
choice(t`With $J=(1,-2)$ and output metric $1$, which direction does $J^{\mathsf T}J$ annihilate?`,[t`$(1,-2)$`,t`$(2,1)$`,t`$(0,1)$`,t`$(1,0)$`],1,t`$J(2,1)=2-2=0$, hence $J^{\mathsf T}J(2,1)^{\mathsf T}=0$.`),
]},
{
id:"natural-gradient",domain:"geometry",title:"Natural Gradients",summary:"Choose a step by the change it produces in the system.",minutes:13,sources:[geom,pilot,paper("§§5–6, 11–15"),"Olivia Lanes and James Weaver, How to Read a Quantum Paper (IBM QGSS 2026 workshop)"],
intuition:t`A coordinate gradient tells you how each parameter changes loss. A natural gradient combines that derivative with a local model of how each parameter changes the state or evidence. The update spends its step budget in the geometry you care about.`,
concept:t`Near the current parameters, approximate the loss by its linear change and penalize physical displacement quadratically. This makes responsive directions expensive. Small eigenvalues can yield large coordinate updates, especially for noisy estimates, so step size, ridge damping, and null-space treatment matter.`,
math:t`$$\min_\delta\left[\nabla L^{\mathsf T}\delta+\frac{1}{2\eta}\delta^{\mathsf T}G\delta\right]\quad\Longrightarrow\quad G\delta=-\eta\nabla L.$$
The derivative of the symmetric quadratic is $G\delta/\eta$. For a positive definite $G$, solve the linear system. For a singular $G$, the objective is unbounded if the gradient has a null component. If the gradient lies in the range, $-\eta G^+\nabla L$ is the minimum-Euclidean-norm minimizer. A ridge makes the quadratic strictly convex.`,
example:t`With $G=\operatorname{diag}(4,1/4)$, $\nabla L=(2,1)$, and $\eta=0.1$, the update is $(-0.05,-0.4)$. Its predicted first-order loss change is $2(-0.05)+(-0.4)=-0.5$. A large step in a weak direction can invalidate the local approximation. TriQTO proposes comparing state and measurement geometry and auditing sampled topology. For example, persistent homology tracks connected components and loops across distance scales. Diagnostic value would need to be established against baselines and ablations on held-out evidence, with uncertainty reported.`,
questions:[
num(t`For $G=\operatorname{diag}(2,5)$, $\nabla L=(4,10)$, and $\eta=0.2$, give the second coordinate of $\delta$.`,-0.4,t`Solving $5\delta_2=-0.2(10)$ gives $-0.4$.`),
choice(t`What follows from setting the derivative of the quadratic model to zero?`,[t`$G\delta=-\eta\nabla L$`,t`$G\delta=\eta\nabla L$`,t`$\delta=-\eta G\nabla L$`,t`$\delta=-\eta\nabla L$ for any $G$`],0,t`The derivative is $\nabla L+G\delta/\eta$. Setting it to zero gives $G\delta/\eta=-\nabla L$. Multiply by $\eta$ to get $G\delta=-\eta\nabla L$.`,"step"),
choice(t`What happens to the unregularized local objective if $\nabla L$ has a nonzero null-space component?`,["It has a unique minimum.","Its quadratic part makes every direction costly.","It decreases without bound along one sign of a null direction.","Its minimum is always the zero step."],2,"Along a null direction the quadratic term vanishes. Pick the sign that makes the remaining linear term decrease."),
choice("What would test whether TriQTO’s topology signal improves candidate correction?",["A loop in one illustrative figure.","A held-out comparison with and without the signal under matched conditions.","A low training loss on the topology features.","The existence of a topology module."],1,"The ablation isolates the contribution of the signal while matched evaluation and uncertainty constrain the claim."),
num(t`At $x=1$, reparameterize with $y=2x$. If $G_x=4$, $\partial_xL=8$, and $\eta=0.1$, what is the natural-gradient displacement $\delta y$?`,-0.4,t`The chain rule gives $\partial_y L=4$ and $G_y=(1/2)^2G_x=1$, so $\delta y=-0.4$. This is twice $\delta x=-0.2$.`),
]},
{
id:"circuits",domain:"computing",title:"Gates & Qiskit Circuits",summary:"Translate a circuit into amplitudes, bitstrings, and predictions.",minutes:11,lab:"rotation",sources:[gates,"Roland de Putter, Why Quantum? What Problem Are We Solving? (IBM QGSS 2026)","IBM Quantum Documentation, QuantumCircuit and bit ordering"],
intuition:t`A circuit specifies how to prepare and transform qubits before collecting samples. The gates act on amplitudes, while the register that you read at the end records classical bits.`,
concept:t`Circuits usually initialize in $|0\ldots0\rangle$. Gates act in the order applied, and column-vector formulas multiply with the earliest gate on the right. A Hadamard sends $|0\rangle$ to $|+\rangle$. A controlled-X flips the target only on the control-$1$ branch, with Qiskit accepting the control index first. Qiskit writes qubit zero on the right in state labels. An exact statevector gives probabilities, while finite shots vary.`,
math:t`$$R_y(\theta)|0\rangle=\cos(\theta/2)|0\rangle+\sin(\theta/2)|1\rangle,\qquad p_1=\sin^2(\theta/2).$$
For a two-qubit circuit, place the rotated qubit at index 0 and apply a CNOT to qubit 1. The $|01\rangle$ branch becomes $|11\rangle$ and the $|00\rangle$ branch stays fixed.`,
example:t`At $\theta=\pi/3$, the first rotation gives amplitudes $\sqrt3/2$ and $1/2$. The controlled gate produces $(\sqrt3|00\rangle+|11\rangle)/2$. Exact probabilities are $3/4$ and $1/4$. With $100$ ideal shots the expected $11$ count is $25$, and individual runs fluctuate. The Qiskit snippet calculates the exact distribution.`,
code:"from math import pi\nfrom qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Statevector\n\nqc = QuantumCircuit(2)\nqc.ry(pi / 3, 0)\nqc.cx(0, 1)\nprint(Statevector.from_instruction(qc).probabilities_dict())",
questions:[
num(t`After $R_y(\pi/2)|0\rangle$, what is $p_Z(1)$?`,0.5,t`The amplitude for $1$ is $\sin(\pi/4)=1/\sqrt2$. Squaring it gives $1/2$.`),
choice("In a two-qubit Qiskit state label, which ket has only qubit 0 set?",[t`$|10\rangle$`,t`$|00\rangle$`,t`$|01\rangle$`,t`$|11\rangle$`],2,"Qubit 0 is the rightmost bit in Qiskit’s labels."),
match("Match each operation or quantity to its interpretation.",["H on qubit 0 initially in 0","cx(0, 1)","A shot histogram"],["Empirical counts","Creates an equal coherent superposition","Flips qubit 1 on the qubit-0 = 1 branch"],[1,2,0],"H acts on amplitudes, CX conditionally changes the target label, and a histogram summarizes classical outcomes."),
choice(t`Apply $H$ and then $X$ to $|0\rangle$. Which column-vector expression follows circuit order?`,[t`$HX|0\rangle$`,t`$XH|0\rangle$`,t`$(H+X)|0\rangle$`,t`$H^\dagger X|0\rangle$`],1,t`Matrix products act on the vector from the right. Applying $H$ first gives $X(H|0\rangle)$.`,"step"),
num(t`Use $\theta=2\pi/3$ in the worked two-qubit circuit. What is the expected count of $11$ in $80$ ideal shots?`,60,t`CNOT routes the qubit-0 = 1 branch to $11$. Its probability is $\sin^2(\pi/3)=3/4$, giving expectation $80(3/4)=60$.`),
]},
{
id:"algorithms",domain:"computing",title:"Phase Estimation & VQE",summary:"Compare two ways to extract energy from a quantum system.",minutes:13,sources:[kirby,"Javier Robledo Moreno, Quantum Algorithms II: Sample-Based Approaches for Quantum Simulation (IBM QGSS 2026)","Vincent Pascuzzi, Quantum + HPC: Hybrid Workflows (IBM QGSS 2026)"],
intuition:t`An energy eigenvalue is hidden inside the time evolution as a phase. Quantum phase estimation extracts that phase coherently. VQE approaches the ground energy by measuring the energy of trial states and improving their parameters using a classical optimizer.`,
concept:t`For phase estimation, assume $U|u\rangle=e^{2\pi i\phi}|u\rangle$ and supply the eigenstate. Controlled powers encode the phase on a register, and an inverse quantum Fourier transform decodes it. With $m$ bits, an exactly representable phase $k/2^m$ gives $k$ ideally. For $U=e^{-iHt}$ with $\hbar=1$, the phase gives $-Et/(2\pi)$ modulo one. Mapping it back to energy requires a known branch. In VQE, the minimum exact trial expectation is bounded below by the ground energy.`,
math:t`$$|\psi\rangle=\sum_j c_j |E_j\rangle \quad\Longrightarrow\quad \langle H\rangle=\sum_j|c_j|^2E_j\ge E_{\min}.$$
The weights are nonnegative and sum to one, proving the variational bound. In practice one can decompose $H$ into Pauli terms and estimate each expectation from measurements. Finite-shot estimates can fluctuate below the true ground energy.`,
example:t`Let $H=Z$ and $t=\pi/2$. For $|1\rangle$ with energy $-1$, $U$ has eigenphase $e^{i\pi/2}$, so $\phi=1/4$ and two phase qubits ideally encode integer $1$ (binary $01$). For a VQE trial $R_y(\theta)|0\rangle$, the exact expectation is $\cos\theta$. The trial family attains the ground energy at $\theta=\pi$, where the state is $|1\rangle$.`,
questions:[
num(t`Which integer is returned ideally for phase $3/8$ with three phase qubits?`,3,t`$2^3(3/8)=3$. In three bits the result is $011$.`),
choice("What makes an energy ambiguous when inferred from the phase of time evolution?",["The phase is only defined modulo one.","Hermitian matrices always have degenerate eigenvalues.","QPE gives only an expectation value.","The energy must be positive."],0,t`Energies differing by $2\pi/t$ give the same phase under the stated units.`),
num(t`For $H=2I+Z$ and trial $R_y(\pi/2)|0\rangle$, what is the exact VQE energy?`,2,t`The identity contributes $2$ and $\langle Z\rangle=\cos(\pi/2)=0$.`),
choice("A sampled VQE estimate is below the true ground energy. Which explanation is consistent with the variational principle?",["The true normalized state expectation must also be lower.","The exact bound applies only to positive eigenvalues.","Statistical estimation error can move the reported number below the bound.","Any classical optimization invalidates the bound."],2,"The bound applies to the exact expectation of a physical state. A random estimator need not satisfy it on every run.","mistake"),
num(t`A Hamiltonian has energies $-3$ and $1$. The trial state has ground-state probability $3/4$. Find the exact energy.`,-2,t`The expectation is $(3/4)(-3)+(1/4)(1)=-2$.`),
]},
{
id:"hardware",domain:"computing",title:"Noise & Measurement Evidence",summary:"Diagnose what finite hardware measurements can reveal.",minutes:14,lab:"phase",sources:[noise,paper("§§3–4, 6.5, 14–15"),"Minh Tran, Quantum Algorithms III: Quantum Advantage (IBM QGSS 2026)"],
intuition:t`An ideal circuit predicts a state. A hardware experiment supplies samples from a noisy process. A distorted histogram may come from the state, measurement electronics, or ordinary shot variation. Measuring in a second basis can distinguish effects that one basis merges.`,
concept:t`A density matrix is positive semidefinite with trace one and can describe both pure states and mixtures. A quantum channel is a completely positive trace-preserving map. Dephasing can shrink off-diagonal entries while preserving populations. Relaxation can change populations. Readout mitigation instead targets errors in reported outcomes, often using a calibrated classical assignment model. Mitigation can introduce variance and relies on calibration assumptions.`,
math:t`$$\mathcal E_r(\rho)=(1-r)\rho+r Z\rho Z,\quad p(y)=\operatorname{Tr}(\Pi_y\,\mathcal E_r(\rho)).$$
The random phase-flip channel uses $0\le r\le1$. Conjugating by $Z$ flips the sign of off-diagonal entries, so they shrink by the factor $1-2r$ for $0\le r\le1/2$. For independent Bernoulli shots, $\widehat p$ has standard deviation $\sqrt{p(1-p)/N}$. More shots reduce this variation without eliminating systematic readout bias.`,
example:t`Prepare $|+\rangle$. With $r=1/2$, the output density matrix is $I/2$. Both the original and the dephased state yield $p_Z(0)=1/2$. In $X$, $p(+)$ drops from $1$ to $1/2$. The two different states fit the same exact $Z$ probabilities, so increasing $Z$ shots cannot separate them. In TriQTO, a diagnostic prediction must therefore depend on the measurement family and uncertainty.`,
questions:[
num(t`Prepare $|+\rangle$ and apply the random phase-flip channel with $r=0.2$. Find $p_X(+)$.`,0.8,t`With probability $0.8$ the state stays $|+\rangle$ and with probability $0.2$, $Z$ turns it into $|-\rangle$. The X measurement yields plus with probability $1$ in the first branch and $0$ in the second, so $p_X(+)=0.8(1)+0.2(0)=0.8$.`),
num(t`At true $p=0.5$ with $100$ independent shots, what is the standard deviation of the sample proportion?`,0.05,t`$\sqrt{0.5(0.5)/100}=0.05$.`),
choice(t`What helps distinguish $|+\rangle$ from $I/2$ in the example?`,["One million additional Z shots.","A longer Qiskit circuit with identical measurement effects.","The determinant of a histogram.","Measuring in the X basis."],3,"The X probabilities differ. The Z probability distributions are identical even in the infinite-shot limit."),
match("Match the effect to what it changes.",["Complete dephasing in Z","Relaxation toward 0 from 1","Classical assignment error"],["Reported labels after measurement","Z populations can change","Off-diagonal coherence disappears"],[2,1,0],"Dephasing preserves populations, relaxation can transfer population, and assignment errors alter the reported labels."),
num(t`A detector independently flips each measured bit with calibrated probability $0.1$. It reports $1$ with probability $0.66$. Solve for the true $p(1)$ under this model.`,0.7,t`$0.66=0.9p+0.1(1-p)=0.1+0.8p$, yielding $0.7$. A finite-shot estimate would carry uncertainty.`),
]},
];
