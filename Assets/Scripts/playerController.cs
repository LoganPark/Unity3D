using UnityEngine;
using System.Collections;

public class playerController : MonoBehaviour {
	
	public NetworkPlayer netPlayer;
	public bool isLocalPlayer = false;
    public float speed = 6.0F;
    public float jumpSpeed = 8.0F;
    public float gravity = 20.0F;
	public Vector3 target = Vector3.zero;
	public Material[] materials;
	public float movePrecision = 1.0F;
    private Vector3 moveDirection = Vector3.zero;
	
	
    void Update() {
		
		if(isLocalPlayer){
			
			// move according to local player input
			
	        CharacterController controller = GetComponent<CharacterController>();
	        if (controller.isGrounded) 
			{
	            moveDirection = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
	            moveDirection = transform.TransformDirection(moveDirection);
	            moveDirection *= speed;
	            if (Input.GetButton("Jump"))
	                moveDirection.y = jumpSpeed;
	            
	        }
	        moveDirection.y -= gravity * Time.deltaTime;
	        controller.Move(moveDirection * Time.deltaTime);
			
			if(Input.GetMouseButton(1))
			{
				transform.Rotate(0,(Input.GetAxis("Mouse X") * 5.0F),0);
				Camera.main.transform.Rotate((-Input.GetAxis("Mouse Y") * 5.0F),0,0);
			}
		
		} else {
			
			// move toward target
			
			// normally, you'd do something like using a 
			// target collision sphere and checking for
			// collisions with that target instead of
			// calculating the distance magnitude every
			// frame -- there's a square root function at
			// the heart of .magnitude that is very CPU
			// intensive, so normally you'd avoid doing
			// this
			
			
			if((transform.position - target).magnitude > movePrecision)
			{
				transform.LookAt(target);
				transform.Translate(Vector3.forward * Time.deltaTime * speed);
			}
			
		}

	
	}
}